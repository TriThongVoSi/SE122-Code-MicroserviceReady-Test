UPDATE users
SET password_hash='$2a$10$uyNENat0oOelTYIMxY0p5OMHvh5cB5YPc..12v/N38eIiSUTYEGsa'
WHERE user_name='admin';
SELECT user_name,password_hash FROM users WHERE user_name='admin';
