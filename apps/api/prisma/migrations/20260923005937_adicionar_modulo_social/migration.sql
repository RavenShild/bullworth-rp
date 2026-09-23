-- CreateTable
CREATE TABLE `SocialProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `bio` VARCHAR(300) NULL,
    `interests` VARCHAR(300) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SocialProfile_userId_key`(`userId`),
    INDEX `SocialProfile_active_idx`(`active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SocialLike` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `senderId` INTEGER NOT NULL,
    `receiverId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SocialLike_senderId_idx`(`senderId`),
    INDEX `SocialLike_receiverId_idx`(`receiverId`),
    UNIQUE INDEX `SocialLike_senderId_receiverId_key`(`senderId`, `receiverId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SocialMatch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userOneId` INTEGER NOT NULL,
    `userTwoId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SocialMatch_userOneId_idx`(`userOneId`),
    INDEX `SocialMatch_userTwoId_idx`(`userTwoId`),
    INDEX `SocialMatch_createdAt_idx`(`createdAt`),
    UNIQUE INDEX `SocialMatch_userOneId_userTwoId_key`(`userOneId`, `userTwoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SocialProfile` ADD CONSTRAINT `SocialProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SocialLike` ADD CONSTRAINT `SocialLike_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SocialLike` ADD CONSTRAINT `SocialLike_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SocialMatch` ADD CONSTRAINT `SocialMatch_userOneId_fkey` FOREIGN KEY (`userOneId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SocialMatch` ADD CONSTRAINT `SocialMatch_userTwoId_fkey` FOREIGN KEY (`userTwoId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
