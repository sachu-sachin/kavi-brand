-- CreateTable
CREATE TABLE `Banner` (
    `id` VARCHAR(191) NOT NULL,
    `placement` ENUM('HERO', 'ANNOUNCEMENT', 'PROMO', 'FESTIVE') NOT NULL,
    `eyebrow` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `subtitle` TEXT NULL,
    `image` VARCHAR(191) NULL,
    `ctaLabel` VARCHAR(191) NULL,
    `ctaHref` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Banner_placement_active_idx`(`placement`, `active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
