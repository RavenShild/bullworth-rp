-- CreateTable
CREATE TABLE `JobShift` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `reward` INTEGER NOT NULL DEFAULT 50,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `availableAt` DATETIME(3) NOT NULL,
    `completedAt` DATETIME(3) NULL,

    INDEX `JobShift_userId_idx`(`userId`),
    INDEX `JobShift_startedAt_idx`(`startedAt`),
    INDEX `JobShift_completedAt_idx`(`completedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `JobShift` ADD CONSTRAINT `JobShift_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
