using CAR.Application.Interfaces.Services;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Dtos;
using CAR.Domain.Entities;
using CAR.Domain.Enums;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Services
{
    public class CustomerKycService : ICustomerKycService
    {
        private readonly IKycRepository _kycRepository;
        private readonly ICustomerProfileRepository _customerProfileRepository;
        private readonly IKycOcrService _kycOcrService;
        private readonly IFirebasePhoneService _firebasePhoneService;
        private readonly IPhoneRepository _phoneRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CustomerKycService> _logger;

        public CustomerKycService(
            IKycRepository kycRepository,
            ICustomerProfileRepository customerProfileRepository,
            IKycOcrService kycOcrService,
            IFirebasePhoneService firebasePhoneService,
            IPhoneRepository phoneRepository,
            IUnitOfWork unitOfWork,
            ILogger<CustomerKycService> logger)
        {
            _kycRepository = kycRepository;
            _customerProfileRepository = customerProfileRepository;
            _kycOcrService = kycOcrService;
            _firebasePhoneService = firebasePhoneService;
            _phoneRepository = phoneRepository;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<KycOcrResponseDto> ProcessKycOcrAsync(int userId, KycOcrRequestDto request)
        {
            try
            {
                _logger.LogInformation("KYC OCR: Starting process for UserId: {UserId}", userId);
                
                // Lấy CustomerProfile từ UserId để có CustomerProfileId
                var customerProfile = await _customerProfileRepository.GetByUserIdAsync(userId);
                if (customerProfile == null)
                {
                    _logger.LogError("KYC OCR: Customer profile not found for UserId: {UserId}", userId);
                    throw new InvalidOperationException("Customer profile not found. Please complete registration first.");
                }
                
                _logger.LogInformation("KYC OCR: Found CustomerProfile for UserId: {UserId}, ProfileId: {ProfileId}", userId, customerProfile.Id);
                
                // Dùng userId thay vì customerProfile.Id
                var customerId = userId;
                
                _logger.LogInformation("KYC OCR: Processing for UserId: {UserId}, CustomerId: {CustomerId}", userId, customerId);
                
                // Check if customer already has verified KYC
                var existingKyc = await _kycRepository.GetByCustomerIdAsync(customerId);
                
                if (existingKyc != null && existingKyc.VerificationStatus == KycVerificationStatus.Verified)
                {
                    // Customer already has verified KYC, but allow them to submit new OCR for different CCCD
                    _logger.LogInformation("Customer {CustomerId} already has verified KYC, allowing new OCR submission for potential CCCD change", customerId);
                    
                    // Don't throw exception, allow them to proceed with new OCR
                    // The duplicate CCCD check will happen later in the flow
                }
                
                var ocrResult = await _kycOcrService.ProcessOcrAsync(request);
                
                // Check if OCR failed
                if (!string.IsNullOrEmpty(ocrResult.ErrorMessage))
                {
                    throw new InvalidOperationException(ocrResult.ErrorMessage);
                }

                // Check if CCCD number already exists in database (for other customers)
                if (!string.IsNullOrEmpty(ocrResult.CccdNumber))
                {
                    var existingCccd = await _kycRepository.GetByCccdNumberAsync(ocrResult.CccdNumber);
                    if (existingCccd != null && existingCccd.CustomerId != customerId)
                    {
                        throw new InvalidOperationException("Số CCCD này đã được sử dụng bởi tài khoản khác. Vui lòng sử dụng CCCD của bạn.");
                    }
                }
                
                if (existingKyc == null)
                {
                    var newKyc = new MKyc
                    {
                        CustomerId = customerId,
                        CccdNumber = ocrResult.CccdNumber,
                        FullName = ocrResult.FullName,
                        DateOfBirth = ParseDate(ocrResult.Dob),
                        Gender = MapGenderToEnum(ocrResult.Gender),
                        VerificationStatus = KycVerificationStatus.Pending,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    
                    await _kycRepository.CreateKycAsync(newKyc);
                    await _unitOfWork.SaveChangesAsync();
                }
                else
                {
                    // Update existing KYC with OCR data
                    existingKyc.CccdNumber = ocrResult.CccdNumber;
                    existingKyc.FullName = ocrResult.FullName;
                    existingKyc.DateOfBirth = ParseDate(ocrResult.Dob);
                    existingKyc.Gender = MapGenderToEnum(ocrResult.Gender);
                    existingKyc.VerificationStatus = KycVerificationStatus.Pending;
                    existingKyc.UpdatedAt = DateTime.UtcNow;
                    
                    await _kycRepository.UpdateKycAsync(existingKyc);
                    await _unitOfWork.SaveChangesAsync();
                }
                
                return ocrResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing KYC OCR for customer {UserId}", userId);
                throw;
            }
        }

        public async Task<KycConfirmResponseDto> ConfirmKycAsync(int userId, KycConfirmRequestDto request)
        {
            try
            {
                // Lấy CustomerProfile từ UserId để có CustomerProfileId
                var customerProfile = await _customerProfileRepository.GetByUserIdAsync(userId);
                if (customerProfile == null)
                {
                    throw new ArgumentException("Customer profile not found");
                }
                
                var customerId = customerProfile.Id; // Dùng CustomerProfile.Id thay vì UserId
                
                var existingKyc = await _kycRepository.GetByCustomerIdAsync(customerId);
                
                if (existingKyc == null)
                {
                    throw new InvalidOperationException("KYC record not found. Please process OCR first.");
                }

                if (IsKycVerified(existingKyc))
                {
                    return new KycConfirmResponseDto
                    {
                        Message = "KYC already verified"
                    };
                }

                // Get verified phone from MPhone table
                var phoneRecord = await _phoneRepository.GetByCustomerIdAsync(customerId);
                if (phoneRecord == null || !phoneRecord.IsUsed)
                {
                    throw new InvalidOperationException("Phone number must be verified first. Please complete phone verification.");
                }

                // Check OTP expiry (5 minutes from when it was used)
                if (phoneRecord.UsedAt == null || 
                    phoneRecord.UsedAt.Value.AddMinutes(5) < DateTime.UtcNow)
                {
                    throw new InvalidOperationException("Phone verification expired. Please verify your phone number again.");
                }

                if (!DateTime.TryParse(request.Dob, out var dateOfBirth))
                {
                    throw new ArgumentException("Invalid date of birth format");
                }

                var gender = MapGenderString(request.Gender);
                MarkKycAsVerified(existingKyc, request.FullName, dateOfBirth, gender, request.CccdNumber);
                
                // Cập nhật thông tin vào CustomerProfile
                await UpdateCustomerProfileAsync(customerProfile, request.FullName, phoneRecord.Phone, gender, dateOfBirth);
                
                await _kycRepository.UpdateKycAsync(existingKyc);
                await _unitOfWork.SaveChangesAsync();

                return new KycConfirmResponseDto
                {
                    Message = "KYC verified successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error confirming KYC for customer {UserId}", userId);
                throw;
            }
        }

        public async Task<KycPhoneResponseDto> SendPhoneOtpAsync(int userId, KycPhoneRequestDto request)
        {
            try
            {
                var customerProfile = await _customerProfileRepository.GetByUserIdAsync(userId);
                if (customerProfile == null)
                {
                    throw new ArgumentException("Customer profile not found");
                }
                
                var customerId = customerProfile.Id;
                var kyc = await _kycRepository.GetByCustomerIdAsync(customerId);
                
                if (kyc == null)
                {
                    throw new InvalidOperationException("KYC record not found. Please process OCR first.");
                }

                // Format phone number to match FirebasePhoneService format
                var formattedPhone = request.Phone.StartsWith("0") ? $"+84{request.Phone.Substring(1)}" : request.Phone;

                // Check if phone number is already VERIFIED by any customer
                var existingVerifiedPhone = await _phoneRepository.GetVerifiedPhoneAsync(formattedPhone);
                if (existingVerifiedPhone != null)
                {
                    throw new InvalidOperationException("Số điện thoại này đã được xác minh bởi tài khoản khác. Vui lòng sử dụng số điện thoại khác.");
                }

                // Check if phone is already verified by current customer
                var existingPhoneRecord = await _phoneRepository.GetByPhoneAndCustomerIdAsync(formattedPhone, customerId);
                if (existingPhoneRecord != null && existingPhoneRecord.IsUsed)
                {
                    return new KycPhoneResponseDto
                    {
                        Message = "Phone number already verified",
                        PhoneVerified = true,
                        PhoneVerifiedAt = existingPhoneRecord.UsedAt,
                        Status = kyc.VerificationStatus
                    };
                }

                // Send OTP
                await _firebasePhoneService.SendPhoneOtpAsync(request.Phone, customerId);
                
                // Update KYC record
                kyc.VerificationStatus = KycVerificationStatus.PhonePending;
                kyc.UpdatedAt = DateTime.UtcNow;
                
                await _kycRepository.UpdateKycAsync(kyc);
                await _unitOfWork.SaveChangesAsync();

                return new KycPhoneResponseDto
                {
                    Message = "OTP sent successfully",
                    PhoneVerified = false,
                    Status = KycVerificationStatus.PhonePending
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending phone OTP for customer {UserId}", userId);
                throw;
            }
        }

        public async Task<KycPhoneResponseDto> VerifyPhoneOtpAsync(int userId, KycOtpRequestDto request)
        {
            try
            {
                var customerProfile = await _customerProfileRepository.GetByUserIdAsync(userId);
                if (customerProfile == null)
                {
                    throw new ArgumentException("Customer profile not found");
                }
                
                var customerId = customerProfile.Id;
                var kyc = await _kycRepository.GetByCustomerIdAsync(customerId);
                
                if (kyc == null)
                {
                    throw new InvalidOperationException("KYC record not found. Please process OCR first.");
                }

                // Format phone number to match FirebasePhoneService format
                var formattedPhone = request.Phone.StartsWith("0") ? $"+84{request.Phone.Substring(1)}" : request.Phone;

                // Check if phone is already verified by checking MPhone table
                var existingPhoneRecord = await _phoneRepository.GetByPhoneAndCustomerIdAsync(formattedPhone, customerId);
                if (existingPhoneRecord != null && existingPhoneRecord.IsUsed)
                {
                    return new KycPhoneResponseDto
                    {
                        Message = "Phone number already verified",
                        PhoneVerified = true,
                        PhoneVerifiedAt = existingPhoneRecord.UsedAt,
                        Status = kyc.VerificationStatus
                    };
                }

                // Verify OTP using MPhone table
                var phoneRecord = await _phoneRepository.GetByPhoneAndCustomerIdAsync(formattedPhone, customerId);
                if (phoneRecord == null || phoneRecord.Otp != request.Otp || phoneRecord.ExpiresAt < DateTime.UtcNow)
                {
                    throw new InvalidOperationException("Invalid or expired OTP code");
                }

                // Mark OTP as used
                await _phoneRepository.MarkOtpAsUsedAsync(phoneRecord.Phone, phoneRecord.Otp);

                // Update KYC record to reflect phone verification
                kyc.VerificationStatus = KycVerificationStatus.PhoneVerified;
                kyc.UpdatedAt = DateTime.UtcNow;
                
                await _kycRepository.UpdateKycAsync(kyc);
                await _unitOfWork.SaveChangesAsync();

                return new KycPhoneResponseDto
                {
                    Message = "Phone number verified successfully",
                    PhoneVerified = true,
                    PhoneVerifiedAt = DateTime.UtcNow,
                    Status = KycVerificationStatus.PhoneVerified
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying phone OTP for customer {UserId}", userId);
                throw;
            }
        }

        public async Task<KycStatusResponseDto> GetKycStatusAsync(int userId)
        {
            try
            {
                // Lấy CustomerProfile từ UserId để có CustomerProfileId
                var customerProfile = await _customerProfileRepository.GetByUserIdAsync(userId);
                if (customerProfile == null)
                {
                    throw new ArgumentException("Customer profile not found");
                }
                
                var customerId = customerProfile.Id; // Dùng CustomerProfile.Id thay vì UserId
                
                var kyc = await _kycRepository.GetByCustomerIdAsync(customerId);
                
                if (kyc == null)
                {
                    return new KycStatusResponseDto
                    {
                        Status = "NONE"
                    };
                }

                return new KycStatusResponseDto
                {
                    Status = kyc.VerificationStatus.ToString().ToUpper()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting KYC status for customer {UserId}", userId);
                throw;
            }
        }

        private DateTime? ParseDate(string dateString)
        {
            if (string.IsNullOrEmpty(dateString))
                return null;

            if (DateTime.TryParse(dateString, out var date))
                return DateTime.SpecifyKind(date, DateTimeKind.Utc);

            // Try parsing DD/MM/YYYY format
            if (DateTime.TryParseExact(dateString, "dd/MM/yyyy", null, System.Globalization.DateTimeStyles.None, out var parsedDate))
                return DateTime.SpecifyKind(parsedDate, DateTimeKind.Utc);

            return null;
        }

        private KycGender MapGenderToEnum(string gender)
        {
            return gender.ToLower() switch
            {
                "male" or "nam" => KycGender.Male,
                "female" or "nữ" or "nu" => KycGender.Female,
                _ => KycGender.Unknown
            };
        }

        private KycGender MapGenderString(string gender)
        {
            return gender.ToLower() switch
            {
                "male" or "nam" => KycGender.Male,
                "female" or "nữ" or "nu" => KycGender.Female,
                "other" => KycGender.Other,
                _ => KycGender.Unknown
            };
        }

        private bool IsKycVerified(MKyc kyc)
        {
            return kyc.VerificationStatus == KycVerificationStatus.Verified;
        }

        private bool IsKycPending(MKyc kyc)
        {
            return kyc.VerificationStatus == KycVerificationStatus.Pending;
        }

        private bool IsKycNone(MKyc kyc)
        {
            return kyc.VerificationStatus == KycVerificationStatus.None;
        }

        private void MarkKycAsVerified(MKyc kyc, string fullName, DateTime dateOfBirth, KycGender gender, string cccdNumber)
        {
            kyc.VerificationStatus = KycVerificationStatus.Verified;
            kyc.FullName = fullName;
            kyc.DateOfBirth = dateOfBirth;
            kyc.Gender = gender;
            kyc.CccdNumber = cccdNumber;
            kyc.VerifiedAt = DateTime.UtcNow;
            kyc.UpdatedAt = DateTime.UtcNow;
        }

        private void SetKycDocuments(MKyc kyc, string frontUrl, string backUrl)
        {
            kyc.FrontDocumentUrl = frontUrl;
            kyc.BackDocumentUrl = backUrl;
            kyc.VerificationStatus = KycVerificationStatus.Pending;
            kyc.UpdatedAt = DateTime.UtcNow;
        }

        private async Task UpdateCustomerProfileAsync(MCustomerProfile customerProfile, string fullName, string phone, KycGender gender, DateTime? dateOfBirth)
        {
            // Update customer profile with KYC information
            customerProfile.Name = fullName;
            customerProfile.Phone = phone;
            customerProfile.Gender = gender;
            customerProfile.DateOfBirth = dateOfBirth; // Map từ KYC DateOfBirth
            customerProfile.UpdatedAt = DateTime.UtcNow;
            
            await _customerProfileRepository.UpdateCustomerProfileAsync(customerProfile);
        }
    }
}
