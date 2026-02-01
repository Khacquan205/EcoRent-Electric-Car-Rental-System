using CAR.Application.Dtos;
using CAR.Application.Exceptions;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Services
{
    public class PostService : IPostService
    {
        private readonly IPostRepository _postRepository;
        private readonly IOwnerProfileRepository _ownerProfileRepository;
        private readonly IOwnerSubscriptionRepository _ownerSubscriptionRepository;
        private readonly IUnitOfWork _unitOfWork;

        public PostService(
            IPostRepository postRepository,
            IOwnerProfileRepository ownerProfileRepository,
            IOwnerSubscriptionRepository ownerSubscriptionRepository,
            IUnitOfWork unitOfWork)
        {
            _postRepository = postRepository;
            _ownerProfileRepository = ownerProfileRepository;
            _ownerSubscriptionRepository = ownerSubscriptionRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<CreatePostResponseDto> CreatePostAsync(int userId, CreatePostRequestDto request)
        {
            var currentTime = DateTime.UtcNow;

            var verifiedOwner = await _ownerProfileRepository.GetVerifiedOwnerByUserIdAsync(userId);
            if (verifiedOwner == null)
            {
                throw new UserFriendlyException(
                    403,
                    "OWNER_NOT_VERIFIED",
                    "User is not registered as a verified owner"
                );
            }

            var activeSubscription = await _ownerSubscriptionRepository.GetValidActiveSubscriptionAsync(verifiedOwner.Id, currentTime);
            if (activeSubscription == null)
            {
                throw new UserFriendlyException(
                    403,
                    "NO_VALID_SUBSCRIPTION",
                    "No valid active subscription found"
                );
            }

            var post = await _postRepository.CreatePendingPostAsync(request, verifiedOwner.Id, currentTime);

            activeSubscription.ConsumeOnePost();
            _ownerSubscriptionRepository.Update(activeSubscription);

            await _unitOfWork.SaveChangesAsync();

            return new CreatePostResponseDto
            {
                Id = post.Id,
                Status = post.Status
            };
        }
    }
}
