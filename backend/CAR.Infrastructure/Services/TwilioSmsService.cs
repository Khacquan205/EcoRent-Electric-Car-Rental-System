using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace CAR.Infrastructure.Services
{
    public interface ITwilioSmsService
    {
        Task SendSmsAsync(string toPhoneNumber, string message);
    }

    public class TwilioSmsService : ITwilioSmsService
    {
        private readonly string _accountSid;
        private readonly string _authToken;
        private readonly string _fromPhoneNumber;
        private readonly ILogger<TwilioSmsService> _logger;

        public TwilioSmsService(IConfiguration configuration, ILogger<TwilioSmsService> logger)
        {
            _accountSid = configuration["Twilio:AccountSid"];
            _authToken = configuration["Twilio:AuthToken"];
            _fromPhoneNumber = configuration["Twilio:PhoneNumber"];
            _logger = logger;

            if (string.IsNullOrEmpty(_accountSid) || string.IsNullOrEmpty(_authToken) || string.IsNullOrEmpty(_fromPhoneNumber))
            {
                _logger.LogWarning("Twilio configuration is missing. SMS sending will be disabled.");
            }
            else
            {
                TwilioClient.Init(_accountSid, _authToken);
                _logger.LogInformation("Twilio SMS Service initialized successfully");
            }
        }

        public async Task SendSmsAsync(string toPhoneNumber, string message)
        {
            try
            {
                if (string.IsNullOrEmpty(_accountSid) || string.IsNullOrEmpty(_authToken) || string.IsNullOrEmpty(_fromPhoneNumber))
                {
                    _logger.LogWarning("Twilio not configured. SMS not sent to {Phone}", toPhoneNumber);
                    return;
                }

                var messageOptions = new CreateMessageOptions(
                    new PhoneNumber(toPhoneNumber))
                {
                    From = new PhoneNumber(_fromPhoneNumber),
                    Body = message
                };

                var messageResource = await MessageResource.CreateAsync(messageOptions);
                
                _logger.LogInformation("SMS sent successfully to {Phone}. SID: {Sid}", toPhoneNumber, messageResource.Sid);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Failed to send SMS to {Phone}", toPhoneNumber);
                throw;
            }
        }
    }
}
