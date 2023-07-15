-- Adminer 4.8.1 MySQL 5.5.5-10.4.19-MariaDB dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `applications`;
CREATE TABLE `applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `allow_integration` boolean DEFAULT false,
  `category_id` int(11) NOT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `application_categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `applications` (`id`, `name`, `description`,`allow_integration`, `category_id`, `logo_url`, `active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1,	'QuickBooks',	'An accounting software package',true,	1,	'https://example.com/logo.png',	1,	'2023-05-02 13:18:00',	'2023-05-02 13:19:39',	NULL),
(2,	'Zoho Books',	'An accounting software package',true,	1,	'https://example.com/logo.png',	1,	'2023-05-02 15:33:57',	'2023-05-02 15:34:49',	'2023-05-02 15:34:49'),
(3,	'Zoho People',	'A HR software package',true,	3,	'https://example.com/logo.png',	1,	'2023-05-02 15:33:57',	'2023-05-02 15:34:49',	'2023-05-02 15:34:49'),
(5,	'Jira',	'A project management tool',true,	3,	'https://example.com/logo.png',	1,	'2023-05-02 15:33:57',	'2023-05-02 15:34:49',	'2023-05-02 15:34:49'),
(6,	'Okta',	'A cloud-based identity management platform',true,	2,	'https://example.com/logo.png',	1,	'2023-05-02 15:33:57',	'2023-05-02 15:34:49',	'2023-05-02 15:34:49');

DROP TABLE IF EXISTS `application_categories`;
CREATE TABLE `application_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `application_categories` (`id`, `name`, `active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(0,	'Unkown',	1,	'2023-05-02 12:51:51',	'2023-05-02 13:16:46',	NULL),
(1,	'Finance',	1,	'2023-05-02 12:51:51',	'2023-05-02 13:16:46',	NULL),
(2,	'Marketing',	1,	'2023-05-02 19:28:40',	'2023-05-02 19:28:40',	NULL),
(3,	'HR',	1,	'2023-05-02 19:28:40',	'2023-05-02 19:28:40',	NULL);

DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organization_id` int(11) NOT NULL,
  `department_id` varchar(255) NOT NULL,
  `head_id` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `organization_id` (`organization_id`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `organizations`;
CREATE TABLE `organizations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hashed_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `onboarding_status` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `organizations` (`id`, `hashed_id`, `name`, `address`, `phone`, `contact_person`, `logo_url`, `onboarding_status`, `active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1,	1677288997,	'Sample Organization1',	'123 Main St',	'555-555-1234',	'John Doe',	'https://example.com/logo.png',	'not_started',	1,	'2023-05-02 14:04:36',	'2023-05-02 15:55:04',	'2023-05-02 15:55:04'),
(2,	1677288998,	'Sample Organization2',	'123 Main St',	'555-555-1234',	'John Doe',	'https://example.com/logo.png',	'not_started',	1,	'2023-05-02 14:04:36',	'2023-05-02 15:55:04',	'2023-05-02 15:55:04'),
(3,	1677288999,	'Sample Organization3',	'123 Main St',	'555-555-1234',	'John Doe',	'https://example.com/logo.png',	'not_started',	1,	'2023-05-02 14:04:36',	'2023-05-02 15:55:04',	'2023-05-02 15:55:04');

DROP TABLE IF EXISTS `organization_applications`;
CREATE TABLE `organization_applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organization_id` int(11) NOT NULL, 
  `application_id` int(11) NOT NULL,
  `vendor_name` varchar(255) DEFAULT NULL,
  `vendor_id` varchar(255) DEFAULT NULL,
  `integration_status` enum('pending','active','disabled','error') NOT NULL DEFAULT 'pending',
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `organization_id` (`organization_id`),
  KEY `application_id` (`application_id`),
  CONSTRAINT `organization_applications_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`),
  CONSTRAINT `organization_applications_ibfk_2` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- INSERT INTO `organization_applications` (`id`, `organization_id`, `application_id`, `integration_status`, `data`, `active`, `created_at`, `updated_at`, `deleted_at`) VALUES
-- (1,	1,	1,	'active',	'{\"accessToken\":\"eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiZGlyIn0..H7P0-DNx39Z6hnFeDvoPKA.Zb10PJli1YC7-9jServBi-NM6H6IZtmjCjRheeTKhAZoClzq6zhLM9YIUmW04OqBFqFwHSgpDUfVmKX0aeOtgBu4kJ7XJ1Vp_LGbBKrAu5wRu9eon3HvriDFtXcytbSjUC9diIv7WYSdgP8-QBdC8a0X4l306R4Cap6lr7dQKxWOPK8-roGLQX_phqJyGTm39Gbj37trbwYYy2BO7TzGe2iBj1ObNYw41OC3skNXplkGELFC9kL2VqnZfvEbuY5fL0FEUw0UJ10ert48l2b3EZ93fz19oajKcDOy7L2ZezDEietWf2F0vtQv-dYnjcES9iLbGdued1hkdTKRYCDCecZvTMhfUTwD3AJu0B2msYyBeQWZmFOzFCuEL6uGY_AJ6QoEU3-bhNvDASZf959b35eSl_7kDIPSB6-KOmc1VHR_iT20J3x8-W9VtP-CcJI6tQ0h7AFOslum8O_oWBbs_gV88KWHFk-VC7V9-on4mtAOGJhr8SLXKWlGbJ1k4YdzQavlbcbSC_Ht4tQRadYoy9mYBc2Dt7mcsBfQqIXeCNsdNe4imahpRp-BgFj9y81cl5JJDdCvM6OzMSamnFEHge_cZcq-OCz8RuH34BeGI9_MFIBGTtc87wNdjbK-wReX9V7ry8XBXBE3CZ5zbnErKYvhxiv6SKcLZe51Rn2f97zdQYNSPlqJpg4uMwqDDHKPqy5dWWZOP2fdfU5kvdPDHK71vAd2pSYUzUmlS7C7RkOHVrRkvzKpGopf_QoInoZl.xN1ZGQCNQlXkUBAQhDy9LA\",\"refreshToken\":\"AB11696244623zv07Oapea9KSGapt6IMyaQpDqcJPP0mfZWZER\",\"companyId\":\"4620816365302589930\",\"tokenType\":\"bearer\",\"expiresIn\":3600,\"refreshTokenExpiresIn\":8726400}',	1,	'2023-05-02 16:42:09',	'2023-05-03 17:48:19',	NULL),
-- (2,	1,	2,	'active',	NULL,	1,	'2023-05-02 16:42:09',	'2023-05-03 17:48:19',	NULL),
-- (3,	2,	1,	'active',	'{\"accessToken\":\"eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiZGlyIn0..H7P0-DNx39Z6hnFeDvoPKA.Zb10PJli1YC7-9jServBi-NM6H6IZtmjCjRheeTKhAZoClzq6zhLM9YIUmW04OqBFqFwHSgpDUfVmKX0aeOtgBu4kJ7XJ1Vp_LGbBKrAu5wRu9eon3HvriDFtXcytbSjUC9diIv7WYSdgP8-QBdC8a0X4l306R4Cap6lr7dQKxWOPK8-roGLQX_phqJyGTm39Gbj37trbwYYy2BO7TzGe2iBj1ObNYw41OC3skNXplkGELFC9kL2VqnZfvEbuY5fL0FEUw0UJ10ert48l2b3EZ93fz19oajKcDOy7L2ZezDEietWf2F0vtQv-dYnjcES9iLbGdued1hkdTKRYCDCecZvTMhfUTwD3AJu0B2msYyBeQWZmFOzFCuEL6uGY_AJ6QoEU3-bhNvDASZf959b35eSl_7kDIPSB6-KOmc1VHR_iT20J3x8-W9VtP-CcJI6tQ0h7AFOslum8O_oWBbs_gV88KWHFk-VC7V9-on4mtAOGJhr8SLXKWlGbJ1k4YdzQavlbcbSC_Ht4tQRadYoy9mYBc2Dt7mcsBfQqIXeCNsdNe4imahpRp-BgFj9y81cl5JJDdCvM6OzMSamnFEHge_cZcq-OCz8RuH34BeGI9_MFIBGTtc87wNdjbK-wReX9V7ry8XBXBE3CZ5zbnErKYvhxiv6SKcLZe51Rn2f97zdQYNSPlqJpg4uMwqDDHKPqy5dWWZOP2fdfU5kvdPDHK71vAd2pSYUzUmlS7C7RkOHVrRkvzKpGopf_QoInoZl.xN1ZGQCNQlXkUBAQhDy9LA\",\"refreshToken\":\"AB11696244623zv07Oapea9KSGapt6IMyaQpDqcJPP0mfZWZER\",\"companyId\":\"4620816365302589930\",\"tokenType\":\"bearer\",\"expiresIn\":3600,\"refreshTokenExpiresIn\":8726400}',	1,	'2023-05-02 16:42:09',	'2023-05-03 17:48:19',	NULL),
-- (4,	2,	2,	'pending',	NULL,	1,	'2023-05-02 16:42:09',	'2023-05-03 17:48:19',	NULL);

DROP TABLE IF EXISTS `subscriptions`;
CREATE TABLE `subscriptions` (
  `organization_id` int(11) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organization_application_id` int(11) NOT NULL,
  `subscription_id` varchar(255) NOT NULL,
  `vendor_id` varchar(255) DEFAULT NULL,
  `vendor_name` varchar(255) DEFAULT NULL,
  `vendor_category` int(11) DEFAULT NULL,
  `data_source` int(11) NOT NULL,
  `data_source_type` enum('finance_app','self','hr_app') DEFAULT NULL,
  `license_count` int(11) DEFAULT NULL,
  `license_type` varchar(255) DEFAULT NULL,
  `payment_type` enum('upfront','recurring') DEFAULT NULL,
  `total_contract_value` decimal(10,2) DEFAULT NULL,
  `renewal_status` enum('upcoming','due','discarded','paid') DEFAULT NULL,
  `renewal_start_date` date DEFAULT NULL,
  `renewal_end_date` date DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `organization_id` (`organization_id`),
  KEY `organization_application_id` (`organization_application_id`),
  KEY `data_source` (`data_source`),
  KEY `vendor_category` (`vendor_category`),
  CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`),
  CONSTRAINT `subscriptions_ibfk_2` FOREIGN KEY (`organization_application_id`) REFERENCES `organization_applications` (`id`),
  CONSTRAINT `subscriptions_ibfk_3` FOREIGN KEY (`data_source`) REFERENCES `applications` (`id`),
  CONSTRAINT `subscriptions_ibfk_4` FOREIGN KEY (`vendor_category`) REFERENCES `application_categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- INSERT INTO `subscriptions` (`organization_id`, `id`, `organization_application_id`, `data_source`, `data_source_type`, `license_count`, `license_type`, `payment_type`, `total_contract_value`, `renewal_status`, `renewal_start_date`, `renewal_end_date`, `active`, `created_at`, `updated_at`, `deleted_at`) VALUES
-- (1,	1,	1,	1,	'self',	10,	'basic',	'upfront',	1000.00,	'upcoming',	'2023-06-01',	'2023-12-01',	1,	'2023-05-02 17:14:15',	'2023-05-02 17:49:38',	NULL),
-- (1,	2,	1,	1,	'self',	10,	'monthly',	'upfront',	1000.00,	'upcoming',	'2023-06-01',	'2023-12-01',	1,	'2023-05-02 19:58:39',	'2023-05-02 19:58:39',	NULL);

DROP TABLE IF EXISTS `sync_log`;
CREATE TABLE `sync_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organization_id` int(11) NOT NULL,
  `organization_application_id` int(11) NOT NULL,
  `sync_target` varchar(255) NOT NULL,
  `sync_type` enum('manual','scheduled') NOT NULL,
  `sync_status` enum('pending','in_progress','success','failed') NOT NULL DEFAULT 'pending',
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `message` varchar(255) DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `organization_id` (`organization_id`),
  KEY `organization_application_id` (`organization_application_id`),
  CONSTRAINT `sync_log_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`),
  CONSTRAINT `sync_log_ibfk_2` FOREIGN KEY (`organization_application_id`) REFERENCES `organization_applications` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `sync_logs`;
CREATE TABLE `sync_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organization_id` int(11) NOT NULL,
  `organization_application_id` int(11) NOT NULL,
  `sync_target` varchar(255) NOT NULL,
  `sync_type` enum('manual','scheduled') NOT NULL,
  `sync_status` enum('pending','in_progress','success','failed') NOT NULL DEFAULT 'pending',
  `data` longtext DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `organization_id` (`organization_id`),
  KEY `organization_application_id` (`organization_application_id`),
  CONSTRAINT `sync_logs_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sync_logs_ibfk_2` FOREIGN KEY (`organization_application_id`) REFERENCES `organization_applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organization_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `role` enum('superadmin','admin','member') NOT NULL DEFAULT 'admin',
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `organization_id` (`organization_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `users` (`id`,`organization_id`, `email`, `password`, `first_name`, `last_name`,`role`) VALUES
(1, 1 ,	'admin1@gmail.com',	'$2a$10$ulh.ucYizWLgGLg6arGJ8OUToBfYGs.ygdJ2vDytQbGFlC0/0snsW',	'Amr',	'Hammdalla', 'admin'),
(2, 2 ,	'admin2@gmail.com',	'$2a$10$ulh.ucYizWLgGLg6arGJ8OUToBfYGs.ygdJ2vDytQbGFlC0/0snsW',	'Amr',	'Hammdalla', 'admin'),
(3, 3 ,	'admin3@gmail.com',	'$2a$10$ulh.ucYizWLgGLg6arGJ8OUToBfYGs.ygdJ2vDytQbGFlC0/0snsW',	'Amr',	'Hammdalla', 'admin'),
(4, 1 ,	'member1@gmail.com',	'$2a$10$ulh.ucYizWLgGLg6arGJ8OUToBfYGs.ygdJ2vDytQbGFlC0/0snsW',	'Amr',	'Hammdalla','member');
-- 2023-06-03 12:03:33


DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organization_id` int(11) NOT NULL,
  `organization_application_id` int(11) NOT NULL,
  `employee_id` varchar(255) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mobile` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `employee_status` varchar(255) DEFAULT "inactive",
  `department_id` varchar(255) DEFAULT NULL,
  `reporting_to` varchar(255) DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `organization_id` (`organization_id`),
  KEY `organization_application_id` (`organization_application_id`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`),
  CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`organization_application_id`) REFERENCES `organization_applications` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;