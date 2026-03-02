using System.Threading;
using CAR.Application.Interfaces;
using CAR.Application.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CAR.Infrastructure.Data
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private bool _inTransaction;

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
        }

        public Task<int> SaveChangesAsync()
        {
            return _context.SaveChangesAsync();
        }

        /// <summary>
        /// Marks the start of a logical transaction. The actual DB transaction is started
        /// inside the execution strategy when <see cref="CommitAsync"/> runs (required for retry).
        /// </summary>
        public Task BeginTransactionAsync()
        {
            _inTransaction = true;
            return Task.CompletedTask;
        }

        /// <summary>
        /// Commits all pending changes in a single DB transaction, executed via the
        /// retry strategy so transient failures (e.g. on Render) are handled.
        /// </summary>
        public async Task CommitAsync()
        {
            if (!_inTransaction)
            {
                await _context.SaveChangesAsync();
                return;
            }

            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(
                (object?)null,
                async (db, _state, ct) =>
                {
                    await using var transaction = await _context.Database.BeginTransactionAsync(ct);
                    try
                    {
                        await _context.SaveChangesAsync(ct);
                        await transaction.CommitAsync(ct);
                    }
                    finally
                    {
                        await transaction.DisposeAsync();
                    }
                    return true;
                },
                verifySucceeded: null,
                CancellationToken.None);

            _inTransaction = false;
        }

        public Task RollbackAsync()
        {
            _inTransaction = false;
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
