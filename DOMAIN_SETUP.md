# Domain Setup Guide for kmmediatraininginstitute.com

This guide will help you configure your domain `kmmediatraininginstitute.com` for the CI/CD pipeline.

## 🌐 Domain Configuration

### 1. DNS Records Setup

Configure the following DNS records with your domain registrar:

#### Production Environment

```
Type: A
Name: @ (or kmmediatraininginstitute.com)
Value: [Your Production Server IP]
TTL: 300

Type: A
Name: www
Value: [Your Production Server IP]
TTL: 300

Type: A
Name: api
Value: [Your Production Server IP]
TTL: 300
```

#### Staging Environment

```
Type: A
Name: staging
Value: [Your Staging Server IP]
TTL: 300

Type: A
Name: api-staging
Value: [Your Staging Server IP]
TTL: 300
```

### 2. SSL Certificate Setup

#### Option A: Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt update
sudo apt install certbot

# Generate SSL certificate for production
sudo certbot certonly --standalone -d kmmediatraininginstitute.com -d www.kmmediatraininginstitute.com

# Generate SSL certificate for staging
sudo certbot certonly --standalone -d staging.kmmediatraininginstitute.com
```

#### Option B: Commercial SSL Certificate

1. Purchase an SSL certificate from your preferred provider
2. Download the certificate files
3. Place them in the `nginx/ssl/` directory:
   - `kmmediatraininginstitute.com.crt`
   - `kmmediatraininginstitute.com.key`

### 3. SSL Certificate Auto-Renewal

Create a cron job for automatic renewal:

```bash
# Edit crontab
sudo crontab -e

# Add this line for daily renewal check
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🚀 Deployment URLs

After setup, your application will be accessible at:

### Production

- **Main Site**: https://kmmediatraininginstitute.com
- **API**: https://api.kmmediatraininginstitute.com
- **WWW**: https://www.kmmediatraininginstitute.com

### Staging

- **Main Site**: http://staging.kmmediatraininginstitute.com
- **API**: http://api-staging.kmmediatraininginstitute.com

## 🔧 Server Configuration

### 1. Firewall Setup

```bash
# Allow HTTP and HTTPS traffic
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow SSH (if not already configured)
sudo ufw allow ssh

# Enable firewall
sudo ufw enable
```

### 2. Nginx SSL Directory

```bash
# Create SSL directory
sudo mkdir -p /etc/nginx/ssl

# Set proper permissions
sudo chmod 700 /etc/nginx/ssl
sudo chown root:root /etc/nginx/ssl
```

### 3. SSL Certificate Paths

Update the Nginx configuration paths if needed:

```bash
# For Let's Encrypt certificates
sudo ln -s /etc/letsencrypt/live/kmmediatraininginstitute.com/fullchain.pem /etc/nginx/ssl/kmmediatraininginstitute.com.crt
sudo ln -s /etc/letsencrypt/live/kmmediatraininginstitute.com/privkey.pem /etc/nginx/ssl/kmmediatraininginstitute.com.key
```

## 📧 Email Configuration (Optional)

### 1. Email Records

```
Type: MX
Name: @
Value: [Your Email Provider MX Record]
Priority: 10
TTL: 300

Type: TXT
Name: @
Value: "v=spf1 include:[Your Email Provider] ~all"
TTL: 300
```

### 2. Common Email Providers

- **Gmail**: `aspmx.l.google.com`
- **Outlook**: `kmmediatraininginstitute-com.mail.protection.outlook.com`
- **Zoho**: `mx.zoho.com`

## 🔍 Domain Verification

### 1. DNS Propagation Check

```bash
# Check DNS propagation
nslookup kmmediatraininginstitute.com
dig kmmediatraininginstitute.com

# Check from different locations
# Use online tools like whatsmydns.net
```

### 2. SSL Certificate Verification

```bash
# Check SSL certificate
openssl s_client -connect kmmediatraininginstitute.com:443 -servername kmmediatraininginstitute.com

# Test HTTPS redirect
curl -I http://kmmediatraininginstitute.com
```

## 🛠️ Troubleshooting

### Common Issues

1. **DNS Not Propagated**

   - Wait 24-48 hours for full propagation
   - Check with different DNS servers
   - Clear local DNS cache

2. **SSL Certificate Issues**

   - Verify certificate paths in Nginx config
   - Check certificate expiration
   - Ensure proper file permissions

3. **HTTPS Redirect Not Working**
   - Verify Nginx configuration
   - Check firewall settings
   - Test with curl or browser developer tools

### Debug Commands

```bash
# Check Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Test SSL certificate
sudo certbot certificates
```

## 📋 Pre-Deployment Checklist

- [ ] DNS records configured
- [ ] SSL certificates obtained and installed
- [ ] Firewall configured
- [ ] Nginx SSL directory created
- [ ] Domain propagation verified
- [ ] SSL certificate verified
- [ ] HTTPS redirect tested
- [ ] Email records configured (if needed)

## 🔄 Post-Deployment Verification

After deploying your application:

1. **Test Main Domain**: https://kmmediatraininginstitute.com
2. **Test WWW Redirect**: http://www.kmmediatraininginstitute.com
3. **Test API Endpoints**: https://api.kmmediatraininginstitute.com
4. **Test Staging**: http://staging.kmmediatraininginstitute.com
5. **Verify SSL**: Check for padlock in browser
6. **Test Mobile**: Verify responsive design
7. **Performance Test**: Use tools like GTmetrix or PageSpeed Insights

## 📞 Support

If you encounter issues with domain setup:

1. Check your domain registrar's documentation
2. Contact your hosting provider
3. Review Nginx and SSL documentation
4. Check online DNS propagation tools

---

**Last Updated**: December 2024
**Domain**: kmmediatraininginstitute.com
