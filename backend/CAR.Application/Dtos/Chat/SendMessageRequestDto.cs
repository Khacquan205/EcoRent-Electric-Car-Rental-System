using System.ComponentModel.DataAnnotations;

namespace CAR.Application.Dtos.Chat
{
    public class SendMessageRequestDto
    {
        [Required(ErrorMessage = "Content is required")]
        [MaxLength(2000, ErrorMessage = "Content cannot exceed 2000 characters")]
        public string Content { get; set; } = string.Empty;
    }
}
