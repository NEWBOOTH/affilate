--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account (
    id integer NOT NULL,
    fname text,
    lname text,
    email text,
    password text,
    img_url text[],
    referral_code character varying(255),
    task_id integer,
    referred_by_user_id integer,
    balance numeric(15,2) DEFAULT 0.00 NOT NULL,
    telegram_username character varying(255),
    telegram_user_id bigint,
    verified boolean DEFAULT false,
    tasks_completed integer DEFAULT 0
);


ALTER TABLE public.account OWNER TO postgres;

--
-- Name: account_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.account_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.account_id_seq OWNER TO postgres;

--
-- Name: account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.account_id_seq OWNED BY public.account.id;


--
-- Name: account id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account ALTER COLUMN id SET DEFAULT nextval('public.account_id_seq'::regclass);


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account (id, fname, lname, email, password, img_url, referral_code, task_id, referred_by_user_id, balance, telegram_username, telegram_user_id, verified, tasks_completed) FROM stdin;
27	salam	Razak	aulalamdarko24@gmail.com	12345678978	\N	c48a3124-9928-416d-af1b-b991ebabfe69	\N	\N	0.00	\N	\N	f	0
28	salam	Razak	alsalamdarko24@gmail.com	LMsbffmc902	\N	47f06e54-ae2d-4640-8bc7-d84cd031b127	\N	\N	0.00	\N	\N	f	0
29	salam	Razak	allamdarko24@gmail.com	LMsbffmc902	\N	562ab7a5-4cbf-4aad-8b91-a5080ed57ff0	\N	23	0.00	\N	\N	f	0
30	salam	Razak	allamdko24@gmail.com	12345678908754	\N	811b7f20-5073-468c-b574-6f6ae998855e	\N	23	0.00	\N	\N	f	0
33	salam	Razak	abdulsalako24@gmail.com	12345789087654357	\N	1c7303da-e605-46cd-917e-8d223712acf9	\N	32	0.00	\N	\N	f	0
48	salam	Razak	abdulsalamdarko@gmail.com	l,sbffmc902	\N	ee5c7ae1-105d-4333-8bcb-2b9e37f696a9	\N	\N	0.00	\N	\N	f	0
31	salam	Razak	aulalamdao24@gmail.com	213456789087543576	\N	6265b5d7-eedd-48cd-b566-3b3e4167c1cb	\N	23	1.00	\N	\N	f	0
34	sal243we546r7t688	2134567	aseety@gmail.com	123456789756435678	\N	643e2643-19ce-4e55-a492-44284f0990b2	\N	23	0.00	\N	\N	f	0
35	salam	Razak	abdulsadarko24@gmail.com	123456785423	\N	532411e1-9109-4e80-b657-d9582485bf71	\N	23	0.00	\N	\N	f	0
36	salam	Razak	lsalamdarko24@gmail.com	LMsbffmc902	\N	6749e4e6-5aca-4eaa-a95d-cca793924767	\N	23	0.00	\N	\N	f	0
37	josh	dk	lama901@gmail.com	123457867564578	\N	9bb561ea-4cd5-4e68-b90f-41232d21736d	\N	30	0.00	\N	\N	f	0
42	salam	Razak	amdarko24@gmail.com	123456754321345	\N	0ff48275-4e20-446f-a3c5-c6bddc2a0c3b	\N	23	0.00	https://t.me/Fuckendjdjd	\N	f	0
43	salam	Razak	abdulsalamdar@gmail.com	12345678987654322345	\N	2f9635f0-530d-40c8-a1c8-d495180a726a	\N	23	0.00		6294474226	f	0
23	\N	Razak	abdulsamdarko24@gmail.com	LMsbffmc902	\N	feb031fa-5bc9-47df-a8f2-5704f4245e97	\N	23	8.50	@Newcandice	6294293419	t	0
24	\N	Razak	abdulsaldarko24@gmail.com	LMsbffmc902	\N	1ea52b0c-b62f-47d6-9806-8b9465fcc204	\N	\N	12.00	\N	\N	t	0
44	salam	Razak	abdo24@gmail.com	12345678754321345	\N	3fd59d8d-8391-4eb8-9060-4c9afe7ae61c	\N	23	0.00	k	\N	f	0
40	salam	Razak	abdulsalamo24@gmail.com	lmsbffmc902	\N	62cd980d-f29b-4cb8-b62c-c5190b34f882	\N	23	0.00	\N	6305945363	f	0
38	salam	Razak	abdulsalamdarko24@gmail.com	LMsbffmc902	\N	927b7479-195c-4f5a-876a-35e76caebda4	\N	23	0.00	\N	6294293419	f	0
41	salam	Razak	alamdarko24@gmail.com	joshua	\N	966801ca-3d06-435a-9d99-4dfe03fdbc8e	\N	23	0.00	@Fuckendjdjd	6294474226	f	0
45	salam	Razak	a4@gmail.com	lmsbffmc902	\N	2472f3e9-9511-4c66-91e2-d15c93d49bb0	\N	23	0.00	\N	\N	f	0
46	gaspa	aisha	afisumusah@icloud.com	gaspa2255	\N	1d3bf61b-7aa6-4c59-bde3-42087001a9a8	\N	23	0.00	wsedtfvygbuhnjim	5589153063	f	0
47	salam	Razak	abdarko24@gmail.com	gfhgyhujbhvbhjbngv	\N	a726486d-5e8f-4f55-b93c-6c5cd0c493a5	\N	23	0.00	\N	\N	f	0
32	\N	Razak	abdudarko24@gmail.com	LMsbffmc902	\N	302026d3-06d8-476b-bfb0-cd1e122c0a39	\N	23	0.50	\N	\N	t	0
49	CRUZ	eY	lamd9021@gmail.com	LMSBFFMC902	\N	5c430560-e268-4487-9528-b812068472c0	\N	\N	0.00	\N	\N	t	0
25	josuah	KD	bdulsalamdarko24@gmail.com	LMSBFFMC9	\N	dcc4074d-2d93-4f81-a884-88c9cb22338b	\N	\N	2.00	\N	\N	t	0
\.


--
-- Name: account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.account_id_seq', 49, true);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: account account_telegram_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_telegram_username_key UNIQUE (telegram_username);


--
-- Name: account account_referred_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_referred_by_user_id_fkey FOREIGN KEY (referred_by_user_id) REFERENCES public.account(id);


--
-- PostgreSQL database dump complete
--

