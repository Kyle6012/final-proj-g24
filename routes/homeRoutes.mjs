import express from 'express';
import { splashScreen } from '../middleware/splash.mjs';

const router = express.Router();

router.get('/', (req, res, next) => {
    const showSplash = !req.cookies.splashShown;
  
    if (showSplash) {
      res.cookie('splashShown', 'true', { maxAge: 86400000 }); // 24 hours
      res.render('splash');
    } else {
      res.redirect('/feed');
    }
    res.render("index", { title: 'G24' });
});

router.get('*', splashScreen, (req, res, next) => {
  next();
});

export default router;
