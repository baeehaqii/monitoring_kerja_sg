-- Make password column optional (auth now via Siproper external API)
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
