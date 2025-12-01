# CloudFront Signed URL Security Setup

## Overview
This guide implements end-to-end secure video delivery:
- S3 bucket is **private** (not publicly accessible)
- Videos only accessible through **signed CloudFront URLs**
- URLs are signed with RSA 2048 private key
- Expiry time ensures temporary access (configurable per URL)

## Step 1: Generate RSA 2048 Key Pair

```bash
# Generate private key
openssl genrsa -out private_key.pem 2048

# Extract public key
openssl rsa -in private_key.pem -pubout -out public_key.pem

# Display private key (for .env)
cat private_key.pem
```

Keep `private_key.pem` safe - this signs all video URLs. The public key goes to CloudFront.

## Step 2: Create CloudFront Key Pair in AWS

1. **Go to AWS Management Console**
   - Navigate to CloudFront → Key Management → Create key pair

2. **Create a new public key**
   - Paste the contents of `public_key.pem` generated above
   - Give it a descriptive name (e.g., "fenix-video-signing")
   - Copy the **Key Pair ID** (e.g., `APKAIF5J6KLMNO7P2QRS`)

3. **Save Key Pair ID**
   - This goes in `CLOUDFRONT_KEY_PAIR_ID` environment variable

## Step 3: Configure S3 Bucket for Private Access

```bash
# Make bucket private (no public access)
aws s3api put-bucket-acl \
  --bucket fenix-streaming-videos \
  --acl private

# Block public access
aws s3api put-public-access-block \
  --bucket fenix-streaming-videos \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

## Step 4: Create Origin Access Control (OAC)

```bash
# Use AWS CLI to create OAC
aws cloudfront create-origin-access-control \
  --origin-access-control-config \
    Name=FenixVideoOAC,OriginAccessControlOriginType=s3,SigningBehavior=always,SigningProtocol=sigv4
```

Or via AWS Console:
1. Go to CloudFront → Distributions
2. Select your distribution
3. Edit Origins
4. Create or update the S3 origin to use OAC (instead of OAI)
5. Copy the OAC ID

## Step 5: Update S3 Bucket Policy

Add this policy to allow CloudFront OAC access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::fenix-streaming-videos/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

Replace:
- `ACCOUNT_ID` - Your AWS account ID
- `DISTRIBUTION_ID` - Your CloudFront distribution ID

```bash
# Apply the policy
aws s3api put-bucket-policy \
  --bucket fenix-streaming-videos \
  --policy file://bucket-policy.json
```

## Step 6: Enable CloudFront Signing

1. **Edit CloudFront Distribution**
   - Go to CloudFront → Distributions → Select your distribution
   - Edit the **Cache behavior** for `/videos/*`

2. **Enable Restrict Viewer Access**
   - Check "Restrict viewer access (use signed URLs or signed cookies)"
   - Select "Use signed URLs"
   - Add the **Key Group** that contains your public key

3. **Save Changes**
   - CloudFront distribution will update (takes ~5-10 minutes)

## Step 7: Configure Environment Variables

Add to `.env` or Replit secrets:

```env
# CloudFront Signing
CLOUDFRONT_DOMAIN=d123456.cloudfront.net
CLOUDFRONT_KEY_PAIR_ID=APKAIF5J6KLMNO7P2QRS
CLOUDFRONT_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA...
...
-----END RSA PRIVATE KEY-----

# URL Expiry in seconds (default: 3600 = 1 hour)
CLOUDFRONT_URL_EXPIRY=3600
```

## Step 8: Test Signed URL Generation

```bash
# Test endpoint
curl http://localhost:5000/api/videos/1/stream

# Response should include signed URL:
{
  "movieId": 1,
  "title": "Movie Title",
  "streamingUrl": "https://d123456.cloudfront.net/videos/1/playlist.m3u8?Policy=...&Signature=...&Key-Pair-Id=...",
  "qualities": ["hd1080", "hd720", "sd480"],
  "duration": 7200,
  "signedUrls": {
    "hls": "https://d123456.cloudfront.net/videos/1/playlist.m3u8?Policy=...&Signature=...&Key-Pair-Id=..."
  }
}
```

## Security Benefits

✅ **Private S3 Bucket** - Videos cannot be downloaded directly from S3
✅ **Signed URLs** - Each URL is cryptographically signed with your private key
✅ **Expiring Access** - URLs expire (default 1 hour), access doesn't last forever
✅ **Tied to Distribution** - Only CloudFront can serve content, not raw S3
✅ **IP Restriction** (Optional) - Can restrict signed URLs to specific IP ranges
✅ **DRM Ready** - Infrastructure supports DASH-IF Common Encryption (CENC) for DRM

## Troubleshooting

**403 Forbidden when accessing video:**
- Signed URL may have expired
- Key Pair ID mismatch (check `CLOUDFRONT_KEY_PAIR_ID`)
- OAC/OAI not properly configured on distribution
- S3 bucket policy doesn't allow CloudFront access

**"Access Denied" errors:**
- Verify S3 bucket is private (no public ACL)
- Check CloudFront distribution is using OAC (not OAI)
- Ensure S3 bucket policy includes CloudFront distribution ARN

**Signature verification fails:**
- Private key format must be PEM (-----BEGIN RSA PRIVATE KEY-----)
- Public key must match private key
- Check Key Pair ID is correct in CloudFront

## Renewal & Key Rotation

**Every 6-12 months:**
1. Generate new RSA key pair
2. Upload new public key to AWS CloudFront
3. Create new Key Group
4. Update CloudFront distribution to use new key group
5. Update `CLOUDFRONT_PRIVATE_KEY` in environment
6. (Old signed URLs become invalid after expiry)

## Performance Optimization

- **HLS Segment Signing**: Each segment request must include signed URL
  - Solution: Sign HLS master playlist only, not individual segments
- **Wildcard Paths**: Sign with `https://cloudfront.net/videos/*` to allow all paths
  - More flexible but slightly less restrictive

## Cost Estimates

- CloudFront: ~$0.085/GB (varies by region)
- S3 private bucket: ~$0.023/GB storage
- Key Pair: Free (included with CloudFront)

## Next Steps

1. Generate RSA key pair locally
2. Create CloudFront key pair in AWS
3. Apply S3 bucket policy with OAC
4. Enable signed URL restriction in CloudFront
5. Set environment variables in Replit
6. Test signed URL generation with sample video
7. Deploy to production

