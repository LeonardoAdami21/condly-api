-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'SINDICO', 'PORTEIRO', 'MORADOR') NOT NULL DEFAULT 'MORADOR',
    `fcm_token` VARCHAR(512) NULL,
    `condominium_id` VARCHAR(191) NULL,
    `apartment_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_condominium_id_idx`(`condominium_id`),
    INDEX `users_apartment_id_idx`(`apartment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `condominiums` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(14) NOT NULL,
    `street` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(2) NOT NULL,
    `zip_code` VARCHAR(8) NOT NULL,
    `condly_portaria_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `condominiums_cnpj_key`(`cnpj`),
    UNIQUE INDEX `condominiums_condly_portaria_id_key`(`condly_portaria_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `apartments` (
    `id` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `block` VARCHAR(191) NOT NULL DEFAULT '',
    `floor` INTEGER NULL,
    `condominium_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `apartments_condominium_id_block_number_key`(`condominium_id`, `block`, `number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portaria_events` (
    `id` VARCHAR(191) NOT NULL,
    `external_id` VARCHAR(191) NULL,
    `type` ENUM('VISITANTE', 'ENCOMENDA', 'PRESTADOR_SERVICO') NOT NULL,
    `status` ENUM('PENDENTE', 'AUTORIZADO', 'NEGADO', 'FINALIZADO') NOT NULL DEFAULT 'PENDENTE',
    `person_name` VARCHAR(191) NULL,
    `person_document` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `condominium_id` VARCHAR(191) NOT NULL,
    `apartment_id` VARCHAR(191) NOT NULL,
    `responded_by_id` VARCHAR(191) NULL,
    `responded_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `portaria_events_external_id_key`(`external_id`),
    INDEX `portaria_events_apartment_id_status_idx`(`apartment_id`, `status`),
    INDEX `portaria_events_condominium_id_idx`(`condominium_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_condominium_id_fkey` FOREIGN KEY (`condominium_id`) REFERENCES `condominiums`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_apartment_id_fkey` FOREIGN KEY (`apartment_id`) REFERENCES `apartments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `apartments` ADD CONSTRAINT `apartments_condominium_id_fkey` FOREIGN KEY (`condominium_id`) REFERENCES `condominiums`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portaria_events` ADD CONSTRAINT `portaria_events_condominium_id_fkey` FOREIGN KEY (`condominium_id`) REFERENCES `condominiums`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portaria_events` ADD CONSTRAINT `portaria_events_apartment_id_fkey` FOREIGN KEY (`apartment_id`) REFERENCES `apartments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portaria_events` ADD CONSTRAINT `portaria_events_responded_by_id_fkey` FOREIGN KEY (`responded_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

