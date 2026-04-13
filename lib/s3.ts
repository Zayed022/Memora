// lib/s3.ts — S3 is optional. If AWS keys are not set, file uploads are skipped gracefully.

const hasS3 = Boolean(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_ACCESS_KEY_ID !== '...' &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_SECRET_ACCESS_KEY !== '...'
)

let s3Client: any = null

async function getS3() {
  if (!hasS3) return null
  if (s3Client) return s3Client

  const { S3Client } = await import('@aws-sdk/client-s3')
  s3Client = new S3Client({
    region: process.env.AWS_REGION ?? 'us-east-1',
    credentials: {
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })
  return s3Client
}

const BUCKET = process.env.AWS_S3_BUCKET ?? 'memora-uploads'

export async function uploadFile(
  key:         string,
  body:        Buffer | Uint8Array,
  contentType: string
): Promise<string | null> {
  const s3 = await getS3()
  if (!s3) {
    console.log('[s3] skipped — AWS keys not configured')
    return null
  }

  const { PutObjectCommand } = await import('@aws-sdk/client-s3')
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key:    key,
    Body:   body,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
  }))
  return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
}

export async function getPresignedUploadUrl(key: string, contentType: string): Promise<string | null> {
  const s3 = await getS3()
  if (!s3) return null

  const { PutObjectCommand }  = await import('@aws-sdk/client-s3')
  const { getSignedUrl }      = await import('@aws-sdk/s3-request-presigner')
  return getSignedUrl(s3, new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }), { expiresIn: 3600 })
}

export async function getPresignedDownloadUrl(key: string): Promise<string | null> {
  const s3 = await getS3()
  if (!s3) return null

  const { GetObjectCommand } = await import('@aws-sdk/client-s3')
  const { getSignedUrl }     = await import('@aws-sdk/s3-request-presigner')
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn: 3600 })
}

export async function deleteFile(key: string): Promise<void> {
  const s3 = await getS3()
  if (!s3) return

  const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

export function buildS3Key(userId: string, type: string, filename: string): string {
  const ts  = Date.now()
  const ext = filename.split('.').pop() ?? 'bin'
  return `${userId}/${type}/${ts}.${ext}`
}