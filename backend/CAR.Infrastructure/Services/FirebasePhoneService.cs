using CAR.Application.Dtos;
using CAR.Application.Interfaces.Repositories;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Services
{
    public interface IFirebasePhoneService
    {
        Task SendPhoneOtpAsync(string phone, int customerId);
        Task<bool> VerifyPhoneOtpAsync(string phone, string otp, int customerId);
    }

    public class FirebasePhoneService : IFirebasePhoneService
    {
        private readonly FirebaseAuth _firebaseAuth;
        private readonly IPhoneRepository _phoneRepository;
        private readonly ITwilioSmsService _twilioSmsService;
        private readonly ILogger<FirebasePhoneService> _logger;

        public FirebasePhoneService(
            IConfiguration configuration, 
            IPhoneRepository phoneRepository,
            ITwilioSmsService twilioSmsService,
            ILogger<FirebasePhoneService> logger)
        {
            _logger = logger;
            _phoneRepository = phoneRepository;
            _twilioSmsService = twilioSmsService;
            
            try
            {
                // Check if Firebase app already exists
                if (FirebaseApp.DefaultInstance == null)
                {
                    // Initialize Firebase Admin SDK
                    var credential = GoogleCredential.FromFile(Path.Combine(Directory.GetCurrentDirectory(), "serviceAccountKey.json"));
                    var firebaseApp = FirebaseApp.Create(new AppOptions
                    {
                        Credential = credential,
                        ProjectId = configuration["Firebase:ProjectId"]
                    });
                    
                    _firebaseAuth = FirebaseAuth.GetAuth(firebaseApp);
                    _logger.LogInformation("Firebase Phone Service initialized successfully");
                }
                else
                {
                    // Use existing Firebase app
                    _firebaseAuth = FirebaseAuth.GetAuth(FirebaseApp.DefaultInstance);
                    _logger.LogInformation("Using existing Firebase Phone Service");
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Firebase not initialized, using mock OTP service");
                _firebaseAuth = null;
            }
        }

        public async Task SendPhoneOtpAsync(string phone, int customerId)
        {
            try
            {
                // Format phone number for Vietnam (+84)
                var formattedPhone = phone.StartsWith("0") ? $"+84{phone.Substring(1)}" : phone;
                
                if (_firebaseAuth == null)
                {
                    // Mock mode: Generate OTP and store in MPhone table
                    var otp = GenerateOtp();
                    await _phoneRepository.StorePhoneOtpAsync(formattedPhone, otp, customerId, DateTime.UtcNow.AddMinutes(5));
                    
                    // Log ở nhiều level để dễ thấy
                    Console.WriteLine($"*** MOCK MODE - OTP for {formattedPhone}: {otp} ***");
                    _logger.LogInformation("MOCK MODE - OTP for {Phone}: {Otp}", formattedPhone, otp);
                    _logger.LogWarning("OTP GENERATED: Phone={Phone}, Code={Otp}", formattedPhone, otp);
                    return;
                }
                
                // Production mode: Generate OTP and store
                var productionOtp = GenerateOtp();
                await _phoneRepository.StorePhoneOtpAsync(formattedPhone, productionOtp, customerId, DateTime.UtcNow.AddMinutes(5));
                
                // Send SMS via Twilio
                try
                {
                    var smsMessage = $"EcoRent verification code: {productionOtp}. Valid for 5 minutes.";
                    await _twilioSmsService.SendSmsAsync(formattedPhone, smsMessage);
                    _logger.LogInformation("SMS sent successfully to {Phone}", formattedPhone);
                }
                catch (System.Exception ex)
                {
                    _logger.LogError(ex, "Failed to send SMS to {Phone}", formattedPhone);
                    // Don't throw error - OTP is still stored in database for manual testing
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending OTP to {Phone}", phone);
                throw;
            }
        }

        public async Task<bool> VerifyPhoneOtpAsync(string phone, string otp, int customerId)
        {
            try
            {
                // Format phone number
                var formattedPhone = phone.StartsWith("0") ? $"+84{phone.Substring(1)}" : phone;
                
                if (_firebaseAuth == null)
                {
                    // Mock mode: Check against MPhone table
                    _logger.LogInformation("MOCK MODE - Verifying OTP for {Phone}: {Otp}", formattedPhone, otp);
                    
                    var storedPhone = await _phoneRepository.GetByPhoneAndCustomerIdAsync(formattedPhone, customerId);
                    if (storedPhone == null)
                    {
                        _logger.LogWarning("No valid OTP found for {Phone}", formattedPhone);
                        return false;
                    }
                    
                    if (storedPhone.Otp != otp)
                    {
                        _logger.LogWarning("Invalid OTP for {Phone}. Expected: {ExpectedOtp}, Received: {ReceivedOtp}", 
                            formattedPhone, storedPhone.Otp, otp);
                        return false;
                    }
                    
                    // Mark OTP as used
                    await _phoneRepository.MarkOtpAsUsedAsync(storedPhone.Phone, storedPhone.Otp);
                    _logger.LogInformation("OTP verified successfully for {Phone}", formattedPhone);
                    
                    return true;
                }
                
                // Production mode: Verify against MPhone table
                _logger.LogInformation("PRODUCTION MODE - Verifying OTP for {Phone}: {Otp}", formattedPhone, otp);
                
                var storedPhoneProd = await _phoneRepository.GetByPhoneAndCustomerIdAsync(formattedPhone, customerId);
                if (storedPhoneProd == null)
                {
                    _logger.LogWarning("No valid OTP found for {Phone}", formattedPhone);
                    return false;
                }
                
                if (storedPhoneProd.Otp != otp)
                {
                    _logger.LogWarning("Invalid OTP for {Phone}. Expected: {ExpectedOtp}, Received: {ReceivedOtp}", 
                        formattedPhone, storedPhoneProd.Otp, otp);
                    return false;
                }
                
                // Mark OTP as used
                await _phoneRepository.MarkOtpAsUsedAsync(storedPhoneProd.Phone, storedPhoneProd.Otp);
                _logger.LogInformation("OTP verified successfully for {Phone}", formattedPhone);
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying OTP for {Phone}", phone);
                return false;
            }
        }

        private string GenerateOtp()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString();
        }
    }
}
