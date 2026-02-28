using CAR.Application.Dtos;
using CAR.Application.Dtos.OwnerKyc;
using CAR.Application.Exceptions;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Constants;
using CAR.Domain.Entities;
using CAR.Domain.Enums;
using CAR.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace CAR.Infrastructure.Services
{
    public class OwnerKycService : IOwnerKycService
    {
        private readonly IKycRepository _kycRepository;
        private readonly IOwnerProfileRepository _ownerProfileRepository;
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserRepository _userRepository;
        private readonly AppDbContext _dbContext;
        private readonly ILogger<OwnerKycService> _logger;

        public OwnerKycService(
            IKycRepository kycRepository,
            IOwnerProfileRepository ownerProfileRepository,
            INotificationService notificationService,
            IUnitOfWork unitOfWork,
            IUserRepository userRepository,
            AppDbContext dbContext,
            ILogger<OwnerKycService> logger)
        {
            _kycRepository = kycRepository;
            _ownerProfileRepository = ownerProfileRepository;
            _notificationService = notificationService;
            _unitOfWork = unitOfWork;
            _userRepository = userRepository;
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task SubmitKycAsync(int userId, OwnerKycSubmitRequestDto request)
        {
            var parsedDob = ParseDateOfBirth(request.DateOfBirth);
            var extractedIdNumber = request.IdCardNumber?.Trim();

            var strategy = _dbContext.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _dbContext.Database.BeginTransactionAsync();
                try
                {
                    if (!string.IsNullOrEmpty(extractedIdNumber))
                    {
                        var otherOwner = await _ownerProfileRepository.GetByIdNumberAsync(extractedIdNumber);
                        if (otherOwner != null && otherOwner.UserId != userId)
                        {
                            _logger.LogWarning("[SECURITY] Duplicate CCCD attempt detected for UserId = {UserId}", userId);
                            throw new UserFriendlyException(409, "CCCD_ALREADY_USED", "This CCCD has already been used for another owner account.");
                        }
                    }

                    var owner = await _ownerProfileRepository.GetByUserIdAsync(userId);
                    var gender = ParseGender(request.Gender);
                    if (owner == null)
                    {
                        owner = new MOwnerProfile
                        {
                            UserId = userId,
                            Name = request.FullName,
                            FullName = request.FullName,
                            DateOfBirth = parsedDob,
                            Gender = gender,
                            IdNumber = request.IdCardNumber,
                            IdentityVerified = true,
                            RatingAvg = 0,
                            TotalPosts = 0,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        await _ownerProfileRepository.AddAsync(owner);
                        await _unitOfWork.SaveChangesAsync();
                    }
                    else
                    {
                        owner.Name = request.FullName;
                        owner.FullName = request.FullName;
                        owner.DateOfBirth = parsedDob;
                        owner.Gender = gender;
                        owner.IdNumber = request.IdCardNumber;
                        owner.IdentityVerified = true;
                        owner.UpdatedAt = DateTime.UtcNow;
                        _ownerProfileRepository.Update(owner);
                    }

                    var duplicate = await _kycRepository.GetByIdCardNumberAsync(request.IdCardNumber);
                    if (duplicate != null && duplicate.OwnerProfileId != owner.Id)
                        throw new UserFriendlyException(409, "ID_CARD_TAKEN", "This ID card number is already registered");

                    var existing = await _kycRepository.GetByOwnerProfileIdAsync(owner.Id);

                    if (existing != null)
                    {
                        if (existing.VerificationStatus == OwnerVerificationStatus.Approved)
                            throw new UserFriendlyException(400, "KYC_ALREADY_APPROVED", "KYC already approved");

                        existing.IdCardNumber = request.IdCardNumber;
                        existing.FullName = request.FullName;
                        existing.DateOfBirth = parsedDob;
                        existing.VerificationStatus = OwnerVerificationStatus.Approved;
                        existing.RejectionReason = null;
                        existing.VerifiedAt = DateTime.UtcNow;
                        existing.UpdatedAt = DateTime.UtcNow;

                        _kycRepository.Update(existing);
                    }
                    else
                    {
                        var kyc = new MKyc
                        {
                            OwnerProfileId = owner.Id,
                            IdCardNumber = request.IdCardNumber,
                            FullName = request.FullName,
                            DateOfBirth = parsedDob,
                            VerificationStatus = OwnerVerificationStatus.Approved,
                            VerifiedAt = DateTime.UtcNow,
                            CreatedAt = DateTime.UtcNow
                        };
                        await _kycRepository.AddAsync(kyc);
                    }

                    var user = await _userRepository.GetByIdAsync(userId);
                    if (user == null)
                        throw new UserFriendlyException(404, "USER_NOT_FOUND", "User not found");

                    if (user.RoleId != UserRoles.OWNER)
                    {
                        user.RoleId = UserRoles.OWNER;
                        user.UpdatedAt = DateTime.UtcNow;
                        _userRepository.Update(user);
                    }

                    await _unitOfWork.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch (DbUpdateException ex) when (IsDuplicateKeyException(ex))
                {
                    _logger.LogWarning("[SECURITY] Duplicate CCCD attempt detected for UserId = {UserId}", userId);
                    throw new UserFriendlyException(409, "CCCD_ALREADY_REGISTERED", "CCCD already registered.");
                }
            });
        }

        private static bool IsDuplicateKeyException(DbUpdateException ex)
        {
            for (var e = ex.InnerException; e != null; e = e.InnerException)
            {
                if (e is PostgresException pg && pg.SqlState == "23505")
                    return true;
            }
            return false;
        }

        private static DateTime? ParseDateOfBirth(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;
            if (DateTime.TryParse(value, null, System.Globalization.DateTimeStyles.None, out var d)) return d;
            if (DateTime.TryParseExact(value, "dd/MM/yyyy", null, System.Globalization.DateTimeStyles.None, out var d2)) return d2;
            if (DateTime.TryParseExact(value, "yyyy-MM-dd", null, System.Globalization.DateTimeStyles.None, out var d3)) return d3;
            return null;
        }

        private static KycGender ParseGender(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return KycGender.Unknown;
            return value.ToLowerInvariant() switch
            {
                "male" or "nam" => KycGender.Male,
                "female" or "nữ" or "nu" => KycGender.Female,
                "other" or "khác" => KycGender.Other,
                _ => KycGender.Unknown
            };
        }

        public async Task<OwnerKycStatusDto> GetStatusAsync(int userId)
        {
            var owner = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (owner == null)
                throw new UserFriendlyException(404, "OWNER_NOT_FOUND", "Owner profile not found");

            var kyc = await _kycRepository.GetByOwnerProfileIdAsync(owner.Id);
            if (kyc == null)
                return new OwnerKycStatusDto { Status = OwnerVerificationStatus.Pending };

            return new OwnerKycStatusDto
            {
                Status = kyc.VerificationStatus,
                RejectionReason = kyc.RejectionReason,
                VerifiedAt = kyc.VerifiedAt,
                SubmittedAt = kyc.CreatedAt
            };
        }

        public async Task<OwnerProfileResponseDto> GetOwnerProfileAsync(int userId)
        {
            var ownerProfile = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (ownerProfile == null)
            {
                throw new UserFriendlyException(
                    403,
                    "OWNER_NOT_FOUND",
                    "User is not registered as an owner"
                );
            }

            return new OwnerProfileResponseDto
            {
                Id = (int)ownerProfile.Id,
                UserId = ownerProfile.UserId,
                Name = ownerProfile.Name,
                Phone = ownerProfile.Phone,
                IdentityVerified = ownerProfile.IdentityVerified,
                VerificationStatus = ownerProfile.IdentityVerified ? "VERIFIED" : "PENDING",
                VerificationScore = ownerProfile.IdentityVerified ? 1.0m : 0.0m,
                VerifiedAt = ownerProfile.IdentityVerified ? ownerProfile.UpdatedAt : null,
                RejectReason = null,
                RatingAvg = ownerProfile.RatingAvg,
                TotalPosts = ownerProfile.TotalPosts,
                CanCreatePosts = ownerProfile.IdentityVerified
            };
        }
    }
}
