using CAR.Application.Dtos.OwnerKyc;
using CAR.Application.Exceptions;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
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

        public OwnerKycService(
            IKycRepository kycRepository,
            IOwnerProfileRepository ownerProfileRepository,
            INotificationService notificationService,
            IUnitOfWork unitOfWork)
        {
            _kycRepository = kycRepository;
            _ownerProfileRepository = ownerProfileRepository;
            _notificationService = notificationService;
            _unitOfWork = unitOfWork;
        }

        public async Task SubmitKycAsync(int userId, OwnerKycSubmitRequestDto request)
        {
            var owner = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (owner == null)
                throw new UserFriendlyException(404, "OWNER_NOT_FOUND", "Owner profile not found");

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
                existing.DateOfBirth = request.DateOfBirth;
                existing.FrontDocumentUrl = request.FrontDocumentUrl;
                existing.BackDocumentUrl = request.BackDocumentUrl;
                existing.VerificationStatus = OwnerVerificationStatus.Pending;
                existing.RejectionReason = null;
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
                    DateOfBirth = request.DateOfBirth,
                    FrontDocumentUrl = request.FrontDocumentUrl,
                    BackDocumentUrl = request.BackDocumentUrl,
                    VerificationStatus = OwnerVerificationStatus.Pending,
                    CreatedAt = DateTime.UtcNow
                };
                await _kycRepository.AddAsync(kyc);
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

        public async Task<List<OwnerKycSummaryDto>> GetPendingKycAsync()
        {
            return await _kycRepository.Query()
                .Include(k => k.OwnerProfile)
                .Where(k => k.VerificationStatus == OwnerVerificationStatus.Pending)
                .OrderBy(k => k.CreatedAt)
                .Select(k => new OwnerKycSummaryDto
                {
                    OwnerProfileId = k.OwnerProfileId,
                    OwnerName = k.OwnerProfile.Name,
                    IdCardNumber = k.IdCardNumber,
                    FullName = k.FullName,
                    FrontDocumentUrl = k.FrontDocumentUrl,
                    BackDocumentUrl = k.BackDocumentUrl,
                    SubmittedAt = k.CreatedAt
                })
                .ToListAsync();
        }

        public async Task ApproveKycAsync(int ownerProfileId, int adminId)
        {
            var kyc = await _kycRepository.Query()
                .Include(k => k.OwnerProfile)
                .FirstOrDefaultAsync(k => k.OwnerProfileId == ownerProfileId);

            if (kyc == null)
                throw new UserFriendlyException(404, "KYC_NOT_FOUND", "KYC submission not found");

            if (kyc.VerificationStatus != OwnerVerificationStatus.Pending)
                throw new UserFriendlyException(400, "KYC_NOT_PENDING", "KYC is not in pending status");

            kyc.VerificationStatus = OwnerVerificationStatus.Approved;
            kyc.VerifiedAt = DateTime.UtcNow;
            kyc.RejectionReason = null;
            kyc.UpdatedAt = DateTime.UtcNow;

            kyc.OwnerProfile.IdentityVerified = true;
            kyc.OwnerProfile.UpdatedAt = DateTime.UtcNow;

            _kycRepository.Update(kyc);
            await _unitOfWork.SaveChangesAsync();

            await _notificationService.SendToUserAsync(
                kyc.OwnerProfile.UserId,
                "KYC Approved",
                "Your identity verification has been approved. You can now list vehicles.");
        }

        public async Task RejectKycAsync(int ownerProfileId, int adminId, string reason)
        {
            var kyc = await _kycRepository.Query()
                .Include(k => k.OwnerProfile)
                .FirstOrDefaultAsync(k => k.OwnerProfileId == ownerProfileId);

            if (kyc == null)
                throw new UserFriendlyException(404, "KYC_NOT_FOUND", "KYC submission not found");

            if (kyc.VerificationStatus != OwnerVerificationStatus.Pending)
                throw new UserFriendlyException(400, "KYC_NOT_PENDING", "KYC is not in pending status");

            kyc.VerificationStatus = OwnerVerificationStatus.Rejected;
            kyc.RejectionReason = reason;
            kyc.VerifiedAt = null;
            kyc.UpdatedAt = DateTime.UtcNow;

            kyc.OwnerProfile.IdentityVerified = false;
            kyc.OwnerProfile.UpdatedAt = DateTime.UtcNow;

            _kycRepository.Update(kyc);
            await _unitOfWork.SaveChangesAsync();

            await _notificationService.SendToUserAsync(
                kyc.OwnerProfile.UserId,
                "KYC Rejected",
                $"Your identity verification was rejected. Reason: {reason}");
        }
    }
}
