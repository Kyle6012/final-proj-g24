export const splashScreen = async (req, res, next) => {
  // Skip splash for non-HTML requests or specific paths
  const excludedPaths = ['/comments', '/profile', '/user', '/search', '/feed'];
  const shouldShowSplash = (
    req.accepts('html') && 
    !req.cookies.splashShown && 
    !excludedPaths.some(path => req.path.startsWith(path))
  );

  if (shouldShowSplash) {
    	res.cookie('splashShown', 'true', { maxAge: 7200000 }); // 2 hours
    	return res.render('splash', { redirectUrl: req.originalUrl });
  }

  // Set cache headers for all responses
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });

  next();
};
