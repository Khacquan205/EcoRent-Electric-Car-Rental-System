using System.ComponentModel.DataAnnotations;

namespace CAR.Application.Dtos.Chat
{
    public class CreateConversationRequestDto
    {
        [Required(ErrorMessage = "OtherUserId is required")]
        public int OtherUserId { get; set; }

        /// <summary>Optional post context (when starting chat from a listing page).</summary>
        public int? PostId { get; set; }
    }
}
