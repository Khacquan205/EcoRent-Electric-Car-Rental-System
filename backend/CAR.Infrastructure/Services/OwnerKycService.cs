using CAR.Application.Dtos;
using CAR.Application.Dtos.OwnerKyc;
using CAR.Application.Exceptions;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Constants;
using CAR.Domain.Entities;
using CAR.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CAR.Infrastructure.Services
{
    public class OwnerKycService : IOwnerKycService
    {
        private readonly IKycRepository _kycRepository;
        private readonly IOwnerProfileRepository _ownerProfileRepository;
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserRepository _userRepository;

        public OwnerKycService(
            IKycRepository kycRepository,
            IOwnerProfileRepository ownerProfileRepository,
            INotificationService notificationService,
            IUnitOfWork unitOfWork,
            IUserRepository userRepository)
        {
            _kycRepository = kycRepository;
            _ownerProfileRepository = ownerProfileRepository;
            _notificationService = notificationService;
            _unitOfWork = unitOfWork;
            _userRepository = userRepository;
        }

        public async Task SubmitKycAsync(int userId, OwnerKycSubmitRequestDto request)
        {
            var owner = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (owner == null)
            {
                // Create owner profile if it doesn't exist
                owner = new MOwnerProfile
                {
                    UserId = userId,
                    Name = request.FullName,
                    IdentityVerified = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await _ownerProfileRepository.AddAsync(owner);
                await _unitOfWork.SaveChangesAsync();
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
                
                // Parse date from string (support both DD/MM/YYYY and YYYY-MM-DD formats)
                if (DateTime.TryParse(request.DateOfBirth, out var date1))
                {
                    existing.DateOfBirth = date1;
                }
                else if (DateTime.TryParseExact(request.DateOfBirth, "dd/MM/yyyy", null, System.Globalization.DateTimeStyles.None, out var date2))
                {
                    existing.DateOfBirth = date2;
                }
                else
                {
                    existing.DateOfBirth = null;
                }
                existing.FrontDocumentUrl = request.FrontDocumentUrl;
                existing.BackDocumentUrl = request.BackDocumentUrl;
                existing.VerificationStatus = OwnerVerificationStatus.Approved;
                existing.RejectionReason = null;
                existing.VerifiedAt = DateTime.UtcNow;
                existing.UpdatedAt = DateTime.UtcNow;

                _kycRepository.Update(existing);
                
                // Update owner profile with OCR data for existing KYC
                var ownerProfile = await _ownerProfileRepository.GetByUserIdAsync(userId);
                if (ownerProfile != null)
                {
                    ownerProfile.Name = request.FullName;
                    ownerProfile.IdentityVerified = true;
                    ownerProfile.UpdatedAt = DateTime.UtcNow;
                    _ownerProfileRepository.Update(ownerProfile);
                }
                
                // Update user role to OWNER for existing KYC
                var existingUser = await _userRepository.GetByIdAsync(userId);
                if (existingUser != null)
                {
                    existingUser.RoleId = UserRoles.OWNER;
                    existingUser.UpdatedAt = DateTime.UtcNow;
                    _userRepository.Update(existingUser);
                }
            }
            else
            {
                // Parse date for new KYC
                DateTime? parsedDate = null;
                if (DateTime.TryParse(request.DateOfBirth, out var date1))
                {
                    parsedDate = date1;
                }
                else if (DateTime.TryParseExact(request.DateOfBirth, "dd/MM/yyyy", null, System.Globalization.DateTimeStyles.None, out var date2))
                {
                    parsedDate = date2;
                }

                var kyc = new MKyc
                {
                    OwnerProfileId = owner.Id,
                    IdCardNumber = request.IdCardNumber,
                    FullName = request.FullName,
                    DateOfBirth = parsedDate,
                    FrontDocumentUrl = request.FrontDocumentUrl,
                    BackDocumentUrl = request.BackDocumentUrl,
                    VerificationStatus = OwnerVerificationStatus.Approved,
                    VerifiedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };
                await _kycRepository.AddAsync(kyc);
            }

            // Update user role to OWNER immediately
            var newUser = await _userRepository.GetByIdAsync(userId);
            if (newUser != null)
            {
                newUser.RoleId = UserRoles.OWNER;
                newUser.UpdatedAt = DateTime.UtcNow;
                _userRepository.Update(newUser);
            }

            // Update owner profile with OCR data after KYC approval
            if (owner != null)
            {
                owner.Name = request.FullName;
                owner.IdentityVerified = true;
                owner.UpdatedAt = DateTime.UtcNow;
                _ownerProfileRepository.Update(owner);
            }

            await _unitOfWork.SaveChangesAsync();
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
