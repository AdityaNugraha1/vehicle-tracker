--
-- PostgreSQL database dump
--

\restrict kdzaAeP9f4fJTffrdZ0sfgTIAStnWopCp5pL437cxzycKzbbqO9A4jH3ZyE23R8

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: MaintenanceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MaintenanceStatus" AS ENUM (
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."MaintenanceStatus" OWNER TO postgres;

--
-- Name: MaintenanceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MaintenanceType" AS ENUM (
    'ROUTINE_CHECK',
    'OIL_CHANGE',
    'TIRE_REPLACEMENT',
    'BRAKE_SERVICE',
    'ENGINE_REPAIR',
    'OTHER'
);


ALTER TYPE public."MaintenanceType" OWNER TO postgres;

--
-- Name: ReportType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReportType" AS ENUM (
    'VEHICLE_UTILIZATION',
    'MAINTENANCE_HISTORY',
    'FUEL_CONSUMPTION',
    'TRIP_SUMMARY',
    'FINANCIAL'
);


ALTER TYPE public."ReportType" OWNER TO postgres;

--
-- Name: TripStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TripStatus" AS ENUM (
    'SCHEDULED',
    'ACTIVE',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."TripStatus" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'MANAGER',
    'USER'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

--
-- Name: VehicleStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."VehicleStatus" AS ENUM (
    'AVAILABLE',
    'ON_TRIP',
    'MAINTENANCE',
    'OUT_OF_SERVICE',
    'LOADING'
);


ALTER TYPE public."VehicleStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: maintenance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance (
    id text NOT NULL,
    "vehicleId" text NOT NULL,
    type public."MaintenanceType" NOT NULL,
    description text NOT NULL,
    cost double precision,
    date timestamp(3) without time zone NOT NULL,
    status public."MaintenanceStatus" DEFAULT 'SCHEDULED'::public."MaintenanceStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.maintenance OWNER TO postgres;

--
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    id text NOT NULL,
    title text NOT NULL,
    type public."ReportType" NOT NULL,
    "dateRange" jsonb,
    "filePath" text,
    "userId" text NOT NULL,
    "vehicleId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- Name: trips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trips (
    id text NOT NULL,
    "vehicleId" text NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone,
    "startLat" double precision,
    "startLng" double precision,
    "endLat" double precision,
    "endLng" double precision,
    distance double precision,
    "fuelUsed" double precision,
    status public."TripStatus" DEFAULT 'ACTIVE'::public."TripStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.trips OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicles (
    id text NOT NULL,
    "licensePlate" text NOT NULL,
    brand text NOT NULL,
    model text NOT NULL,
    year integer NOT NULL,
    color text NOT NULL,
    status public."VehicleStatus" DEFAULT 'AVAILABLE'::public."VehicleStatus" NOT NULL,
    latitude double precision,
    longitude double precision,
    "fuelLevel" integer,
    odometer integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public.vehicles OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
8c3809d6-4e8b-4e56-b070-33b117e7049d	097ebf7ae4567d453593c9866bfb2f0746668a67bd7ecf43bd49e9505058e8d9	2025-10-28 15:19:43.495852+00	20251028151943_init	\N	\N	2025-10-28 15:19:43.419558+00	1
\.


--
-- Data for Name: maintenance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance (id, "vehicleId", type, description, cost, date, status, "createdAt") FROM stdin;
4b820b11-974a-4057-941f-b54a3cd089e8	03476ebc-9f82-497b-b4b5-9305010f45c1	ROUTINE_CHECK	Regular service and inspection	750000	2024-01-10 00:00:00	COMPLETED	2025-10-28 16:21:25.996
0f5cd15f-df8d-42d6-8193-543de038720d	03476ebc-9f82-497b-b4b5-9305010f45c1	OIL_CHANGE	Engine oil and filter replacement	450000	2024-01-15 00:00:00	COMPLETED	2025-10-28 16:21:25.996
b2b40500-98e1-4fa4-b592-5f8195cc9475	e60feda7-b5bc-4cd4-a39e-f160d4110381	OIL_CHANGE	Regular oil change and filter replacement	350000	2024-02-01 00:00:00	COMPLETED	2025-10-29 09:09:13.598
3b27f089-b736-4d50-85d4-5f2141934cf7	03476ebc-9f82-497b-b4b5-9305010f45c1	TIRE_REPLACEMENT	Replace worn tires	1200000	2024-01-20 00:00:00	COMPLETED	2025-10-28 16:21:25.996
c4c45904-2008-4647-ba14-c067e651b920	e60feda7-b5bc-4cd4-a39e-f160d4110381	ENGINE_REPAIR	aaa	250000	2025-10-30 00:00:00	COMPLETED	2025-10-29 09:15:41.399
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (id, title, type, "dateRange", "filePath", "userId", "vehicleId", "createdAt") FROM stdin;
58a01bd6-8134-4065-b465-82f1e4323b3f	Vehicle Utilization Report - Mon Jan 01 2024 to Wed Jan 31 2024	VEHICLE_UTILIZATION	{"end": "2024-01-31T00:00:00.000Z", "start": "2024-01-01T00:00:00.000Z"}	/home/kevin/projects/vehicle-tracker/backend/reports/vehicle-utilization-2025-10-28T16-22-35-192Z.xlsx	ce7eaf0f-f541-4398-a822-84928acd60a3	\N	2025-10-28 16:22:35.234
f2e45d70-1cb7-4903-896a-59285c6788f7	Maintenance Report - 10/28/2025	MAINTENANCE_HISTORY	\N	/home/kevin/projects/vehicle-tracker/backend/reports/maintenance-report-2025-10-28T16-23-07-696Z.xlsx	ce7eaf0f-f541-4398-a822-84928acd60a3	\N	2025-10-28 16:23:07.719
751876df-5bce-4647-836b-c4de07730680	Trip Summary Report - Mon Jan 01 2024 to Wed Jan 31 2024	TRIP_SUMMARY	{"end": "2024-01-31T00:00:00.000Z", "start": "2024-01-01T00:00:00.000Z"}	/home/kevin/projects/vehicle-tracker/backend/reports/trip-summary-2025-10-28T16-23-28-726Z.xlsx	ce7eaf0f-f541-4398-a822-84928acd60a3	\N	2025-10-28 16:23:28.738
8d08dae5-3e75-452e-bf29-f58eadd7b36c	Vehicle Utilization Report - Mon Jan 01 2024 to Wed Jan 31 2024	VEHICLE_UTILIZATION	{"end": "2024-01-31T00:00:00.000Z", "start": "2024-01-01T00:00:00.000Z"}	/home/kevin/projects/vehicle-tracker/backend/reports/vehicle-utilization-2025-10-28T16-25-20-426Z.xlsx	ce7eaf0f-f541-4398-a822-84928acd60a3	\N	2025-10-28 16:25:20.44
0a929833-14f9-49cb-bb21-49a3e9a5fe21	Vehicle Utilization Report - Tue Sep 30 2025 to Wed Oct 29 2025	VEHICLE_UTILIZATION	{"end": "2025-10-29T00:00:00.000Z", "start": "2025-09-30T00:00:00.000Z"}	/home/kevin/projects/vehicle-tracker/backend/reports/vehicle-utilization-2025-10-29T05-03-52-067Z.xlsx	ca07ab4a-7058-4c5a-a76a-12022b0bbf7a	\N	2025-10-29 05:03:52.116
acef7c62-a882-43a4-afce-0e443358e481	Vehicle Utilization Report - Tue Sep 30 2025 to Wed Oct 29 2025	VEHICLE_UTILIZATION	{"end": "2025-10-29T00:00:00.000Z", "start": "2025-09-30T00:00:00.000Z"}	/home/kevin/projects/vehicle-tracker/backend/reports/vehicle-utilization-2025-10-29T05-07-39-304Z.xlsx	ce7eaf0f-f541-4398-a822-84928acd60a3	\N	2025-10-29 05:07:39.319
6136c1d1-691d-4a6d-9fc2-f663a4970e75	Vehicle Utilization Report - Mon Jan 01 2024 to Wed Jan 31 2024	VEHICLE_UTILIZATION	{"end": "2024-01-31T00:00:00.000Z", "start": "2024-01-01T00:00:00.000Z"}	/home/kevin/projects/vehicle-tracker/backend/reports/vehicle-utilization-2025-10-29T07-50-56-047Z.xlsx	ca07ab4a-7058-4c5a-a76a-12022b0bbf7a	\N	2025-10-29 07:50:56.094
ab79fa94-198b-4da4-83fc-9e971b7132d6	Maintenance Report - 10/29/2025	MAINTENANCE_HISTORY	\N	/home/kevin/projects/vehicle-tracker/backend/reports/maintenance-report-2025-10-29T09-16-05-132Z.xlsx	ca07ab4a-7058-4c5a-a76a-12022b0bbf7a	\N	2025-10-29 09:16:05.172
cc1300dd-76f4-4384-8eae-4b990cf3cfcf	Vehicle Utilization Report - Tue Sep 30 2025 to Wed Oct 29 2025	VEHICLE_UTILIZATION	{"end": "2025-10-29T00:00:00.000Z", "start": "2025-09-30T00:00:00.000Z"}	/home/kevin/projects/vehicle-tracker/backend/reports/vehicle-utilization-2025-10-29T09-16-20-707Z.xlsx	ca07ab4a-7058-4c5a-a76a-12022b0bbf7a	\N	2025-10-29 09:16:20.718
57dee4f2-f9bb-426e-afeb-9dae6184e39d	Trip Summary Report - Tue Sep 30 2025 to Wed Oct 29 2025	TRIP_SUMMARY	{"end": "2025-10-29T00:00:00.000Z", "start": "2025-09-30T00:00:00.000Z"}	/home/kevin/projects/vehicle-tracker/backend/reports/trip-summary-2025-10-29T09-16-42-101Z.xlsx	ca07ab4a-7058-4c5a-a76a-12022b0bbf7a	\N	2025-10-29 09:16:42.113
2d8ef5ce-eac2-4e8a-94b6-b4b8dd38bdce	Trip Summary Report - Tue Sep 09 2025 to Fri Oct 31 2025	TRIP_SUMMARY	{"end": "2025-10-31T00:00:00.000Z", "start": "2025-09-09T00:00:00.000Z"}	/home/kevin/projects/vehicle-tracker/backend/reports/trip-summary-2025-10-29T09-17-42-422Z.xlsx	ca07ab4a-7058-4c5a-a76a-12022b0bbf7a	\N	2025-10-29 09:17:42.436
8c373e5c-37f3-43b8-8577-040816329ccd	Vehicle Utilization Report - Tue Sep 09 2025 to Fri Oct 31 2025	VEHICLE_UTILIZATION	{"end": "2025-10-31T00:00:00.000Z", "start": "2025-09-09T00:00:00.000Z"}	/home/kevin/projects/vehicle-tracker/backend/reports/vehicle-utilization-2025-10-29T09-17-52-206Z.xlsx	ca07ab4a-7058-4c5a-a76a-12022b0bbf7a	\N	2025-10-29 09:17:52.218
23e71be1-53a7-4cc0-8908-d6acc6eb507e	Vehicle Utilization Report - Tue Sep 30 2025 to Wed Oct 29 2025	VEHICLE_UTILIZATION	{"end": "2025-10-29T00:00:00.000Z", "start": "2025-09-30T00:00:00.000Z"}	/home/kevin/projects/vehicle-tracker/backend/reports/vehicle-utilization-2025-10-29T10-12-44-595Z.xlsx	ca07ab4a-7058-4c5a-a76a-12022b0bbf7a	\N	2025-10-29 10:12:44.637
353925c6-d423-4f49-bf6a-f7270be354d6	Vehicle Utilization Report - Tue Sep 30 2025 to Wed Oct 29 2025	VEHICLE_UTILIZATION	{"end": "2025-10-29T00:00:00.000Z", "start": "2025-09-30T00:00:00.000Z"}	/home/kevin/projects/vehicle-tracker/backend/reports/vehicle-utilization-2025-10-29T11-40-10-226Z.xlsx	ca07ab4a-7058-4c5a-a76a-12022b0bbf7a	\N	2025-10-29 11:40:10.269
\.


--
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trips (id, "vehicleId", "startTime", "endTime", "startLat", "startLng", "endLat", "endLng", distance, "fuelUsed", status, "createdAt") FROM stdin;
3d0092d6-b988-4b46-a798-eb81bc88a75f	f0b23a6c-02c9-43ca-af05-c9fbae3c81e4	2024-01-15 08:00:00	2024-01-15 12:30:00	-6.2088	106.8456	-6.1751	106.865	25.5	8.2	COMPLETED	2025-10-28 16:21:25.985
3a3e76d0-3a6c-45fd-ab2a-7081bbef1296	f0b23a6c-02c9-43ca-af05-c9fbae3c81e4	2024-01-16 09:00:00	2024-01-16 14:45:00	-6.1751	106.865	-6.2297	106.6894	32.1	10.5	COMPLETED	2025-10-28 16:21:25.985
4edde415-2b4f-45ec-98cd-e56714864ca1	f0b23a6c-02c9-43ca-af05-c9fbae3c81e4	2024-01-17 07:30:00	2025-10-29 07:24:43.629	-6.2297	106.6894	-6.2297	106.6894	59	13	COMPLETED	2025-10-28 16:21:25.99
2b636d02-7121-44ea-a577-b1af879a41f7	e60feda7-b5bc-4cd4-a39e-f160d4110381	2025-10-29 07:55:55.512	2025-10-29 08:09:09.281	-6.2088	106.8456	-6.2297	106.6894	25	8	COMPLETED	2025-10-29 07:55:55.513
ce1c14e6-2461-4ec2-b3f2-dc02f20816e2	03476ebc-9f82-497b-b4b5-9305010f45c1	2025-10-29 07:56:11.707	2025-10-29 08:09:22.708	-6.2088	106.8456	-6.2297	106.6894	66	19	COMPLETED	2025-10-29 07:56:11.708
fbfcad67-69a1-42df-9f87-ac1b8a3c1918	03476ebc-9f82-497b-b4b5-9305010f45c1	2025-10-29 08:09:33.467	2025-10-29 08:09:36.254	-6.2088	106.8456	-6.2297	106.6894	109	14	COMPLETED	2025-10-29 08:09:33.469
4d0c3749-edcd-4d12-9043-8cbbdda35c3d	03476ebc-9f82-497b-b4b5-9305010f45c1	2025-10-29 08:10:21.206	2025-10-29 08:10:22.213	-6.2088	106.8456	-6.2297	106.6894	90	7	COMPLETED	2025-10-29 08:10:21.207
850d3038-d178-4dab-8371-122bd8dc3e8c	03476ebc-9f82-497b-b4b5-9305010f45c1	2025-10-29 08:10:26.44	2025-10-29 08:10:27.119	-6.2088	106.8456	-6.2297	106.6894	27	10	COMPLETED	2025-10-29 08:10:26.441
afbea8f9-04ba-4aca-bc19-a1afeb021177	03476ebc-9f82-497b-b4b5-9305010f45c1	2025-10-29 08:10:30.949	2025-10-29 08:10:31.637	-6.2088	106.8456	-6.2297	106.6894	100	22	COMPLETED	2025-10-29 08:10:30.95
5a58b605-e5ab-44fa-9458-cbb41439d983	e60feda7-b5bc-4cd4-a39e-f160d4110381	2025-10-29 08:13:44.855	2025-10-29 08:13:46.007	-6.2088	106.8456	-6.2297	106.6894	13	17	COMPLETED	2025-10-29 08:13:44.857
eb6a8d8f-5f60-42f4-9c5d-06c54742adff	03476ebc-9f82-497b-b4b5-9305010f45c1	2025-10-29 08:22:26.885	2025-10-29 08:22:28.14	-6.2088	106.8456	-6.2297	106.6894	18	8	COMPLETED	2025-10-29 08:22:26.887
fcd804ca-b4a9-4d32-9832-e13f8a889833	f0b23a6c-02c9-43ca-af05-c9fbae3c81e4	2025-10-29 12:47:43.463	2025-10-29 12:47:44.876	-6.2088	106.8456	-6.2297	106.6894	108	11	COMPLETED	2025-10-29 12:47:43.464
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, name, role, "createdAt", "updatedAt") FROM stdin;
ce7eaf0f-f541-4398-a822-84928acd60a3	manager@vehicle.com	$2b$12$kfEXzBj41DgT6pKJ2aFAy.btYytZ0Fn2Srx/3GrHja/1W/dncRL6q	Fleet Manager	MANAGER	2025-10-28 16:21:25.696	2025-10-28 16:21:25.696
c1821661-d39e-4940-a32b-92d13553ee36	user@vehicle.com	$2b$12$5QQFiiOp3wK2lKoMP0m1w.CzNNkru622FlAeM.NYZlxbHmPQYl0FO	Regular User	USER	2025-10-28 16:21:25.951	2025-10-28 16:21:25.951
ca07ab4a-7058-4c5a-a76a-12022b0bbf7a	admin@vehicle.com	$2b$12$vFL11TWZ/b8cDPr4dCX5SOfhV49owiyTv1cIpXYS.1sq5Yc1w9LKm	1admin	ADMIN	2025-10-28 16:21:25.438	2025-10-29 14:36:48.123
1066ad91-a910-4a16-832c-dfd3d7a99ba7	a@gmail.com	$2b$12$wa9cQ0sh7PbXmd8ajZOOrubjbizN5uSwvp63BLL2PEu//Q.GJ5P0a	aaaa	ADMIN	2025-10-29 16:05:18.478	2025-10-29 16:07:49.097
0d5f360c-f9f7-41f8-ab88-50f76225f4ef	test-admin@example.com	$2a$12$hash	Test Admin	ADMIN	2025-10-29 19:17:37.903	2025-10-29 19:17:37.903
17599555-729b-4162-ae65-c52e17479ef4	test-manager@example.com	$2a$12$hash	Test Manager	MANAGER	2025-10-29 19:17:37.929	2025-10-29 19:17:37.929
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicles (id, "licensePlate", brand, model, year, color, status, latitude, longitude, "fuelLevel", odometer, "createdAt", "updatedAt", "userId") FROM stdin;
f0b23a6c-02c9-43ca-af05-c9fbae3c81e4	B 1234 CD	Toyota	Hiace	2022	White	AVAILABLE	-6.2297	106.6894	61	45397	2025-10-28 16:21:25.958	2025-10-29 12:47:44.898	ce7eaf0f-f541-4398-a822-84928acd60a3
03476ebc-9f82-497b-b4b5-9305010f45c1	B 5678 EF	Mercedes-Benz	Sprinter	2021	Silver	AVAILABLE	-6.2297	106.6894	0	79310	2025-10-28 16:21:25.964	2025-10-29 08:22:28.153	ce7eaf0f-f541-4398-a822-84928acd60a3
e60feda7-b5bc-4cd4-a39e-f160d4110381	B 7890 KL	Hino	Dutro	2022	White	AVAILABLE	-6.2297	106.6894	50	56818	2025-10-28 16:21:25.974	2025-10-29 09:15:45.763	ce7eaf0f-f541-4398-a822-84928acd60a3
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: maintenance maintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT maintenance_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: vehicles_licensePlate_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "vehicles_licensePlate_key" ON public.vehicles USING btree ("licensePlate");


--
-- Name: maintenance maintenance_vehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance
    ADD CONSTRAINT "maintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES public.vehicles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reports reports_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reports reports_vehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT "reports_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES public.vehicles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: trips trips_vehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT "trips_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES public.vehicles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vehicles vehicles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT "vehicles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict kdzaAeP9f4fJTffrdZ0sfgTIAStnWopCp5pL437cxzycKzbbqO9A4jH3ZyE23R8

