const asyncHandler = (fn) => async (req, res, next) => {
  //to handle async errors in routes and controllers , Eliminates try-catch clutter in routes
  try {
    await fn(req, res, next);
  } catch (err) {
    return res.status(500).json({ message: err.message, success: false });
  }
};

export { asyncHandler };
