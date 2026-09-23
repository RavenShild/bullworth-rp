-- CreateTable
CREATE TABLE `BankTransfer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `senderId` INTEGER NOT NULL,
    `recipientId` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,
    `description` VARCHAR(140) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BankTransfer_senderId_idx`(`senderId`),
    INDEX `BankTransfer_recipientId_idx`(`recipientId`),
    INDEX `BankTransfer_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BankTransfer` ADD CONSTRAINT `BankTransfer_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BankTransfer` ADD CONSTRAINT `BankTransfer_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
