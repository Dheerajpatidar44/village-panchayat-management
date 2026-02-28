-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `role` ENUM('citizen', 'clerk', 'admin') NOT NULL DEFAULT 'citizen',
    `full_name` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegistrationRequest` (
    `id` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `date_of_birth` DATETIME(3) NOT NULL,
    `gender` ENUM('male', 'female', 'other') NOT NULL,
    `aadhaar_number` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NOT NULL,
    `address` TEXT NOT NULL,
    `village` VARCHAR(191) NOT NULL DEFAULT 'Sarahi',
    `pincode` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewed_at` DATETIME(3) NULL,
    `reviewed_by_id` VARCHAR(191) NULL,
    `rejection_reason` TEXT NULL,

    UNIQUE INDEX `RegistrationRequest_aadhaar_number_key`(`aadhaar_number`),
    UNIQUE INDEX `RegistrationRequest_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CitizenProfile` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `aadhaar_number` VARCHAR(191) NOT NULL,
    `date_of_birth` DATETIME(3) NULL,
    `gender` ENUM('male', 'female', 'other') NULL,
    `address` TEXT NULL,
    `village` VARCHAR(191) NULL,
    `pincode` VARCHAR(191) NULL,

    UNIQUE INDEX `CitizenProfile_user_id_key`(`user_id`),
    UNIQUE INDEX `CitizenProfile_aadhaar_number_key`(`aadhaar_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Certificate` (
    `id` VARCHAR(191) NOT NULL,
    `application_number` VARCHAR(191) NOT NULL,
    `citizen_id` VARCHAR(191) NOT NULL,
    `certificate_type` VARCHAR(191) NOT NULL,
    `data` JSON NOT NULL,
    `purpose` TEXT NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processed_at` DATETIME(3) NULL,
    `processed_by_id` VARCHAR(191) NULL,
    `remarks` TEXT NULL,
    `certificate_url` VARCHAR(191) NULL,

    UNIQUE INDEX `Certificate_application_number_key`(`application_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Complaint` (
    `id` VARCHAR(191) NOT NULL,
    `complaint_number` VARCHAR(191) NOT NULL,
    `citizen_id` VARCHAR(191) NOT NULL,
    `complaint_type` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `location` VARCHAR(191) NULL,
    `status` ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open',
    `priority` VARCHAR(191) NOT NULL DEFAULT 'medium',
    `assigned_to_id` VARCHAR(191) NULL,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolved_at` DATETIME(3) NULL,

    UNIQUE INDEX `Complaint_complaint_number_key`(`complaint_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Scheme` (
    `id` VARCHAR(191) NOT NULL,
    `scheme_name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notice` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `notice_type` VARCHAR(191) NOT NULL,
    `is_published` BOOLEAN NOT NULL DEFAULT false,
    `expiry_date` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RegistrationRequest` ADD CONSTRAINT `RegistrationRequest_reviewed_by_id_fkey` FOREIGN KEY (`reviewed_by_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CitizenProfile` ADD CONSTRAINT `CitizenProfile_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Certificate` ADD CONSTRAINT `Certificate_citizen_id_fkey` FOREIGN KEY (`citizen_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Certificate` ADD CONSTRAINT `Certificate_processed_by_id_fkey` FOREIGN KEY (`processed_by_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Complaint` ADD CONSTRAINT `Complaint_citizen_id_fkey` FOREIGN KEY (`citizen_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Complaint` ADD CONSTRAINT `Complaint_assigned_to_id_fkey` FOREIGN KEY (`assigned_to_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Scheme` ADD CONSTRAINT `Scheme_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notice` ADD CONSTRAINT `Notice_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
