/**
 * Async Handler Wrapper
 * Higher-order function that catches async errors in controllers and forwards them to next middleware.
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
