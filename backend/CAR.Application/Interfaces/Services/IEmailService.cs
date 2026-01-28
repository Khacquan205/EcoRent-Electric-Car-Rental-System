namespace CAR.Application.Interfaces.Services
{
    public interface IEmailService
    {
        Task<bool> SendOtpEmailAsync(string email, string otp);
    }
}
