"pg_dump"                      }            affilate    17.2    17.2     �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    41410    affilate    DATABASE     �   CREATE DATABASE affilate WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE affilate;
                     postgres    false            �            1259    41544    account    TABLE     �  CREATE TABLE public.account (
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
    DROP TABLE public.account;
       public         heap r       postgres    false            �            1259    41543    account_id_seq    SEQUENCE     �   CREATE SEQUENCE public.account_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.account_id_seq;
       public               postgres    false    220            �           0    0    account_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.account_id_seq OWNED BY public.account.id;
          public               postgres    false    219            �            1259    41470 	   referrals    TABLE     K  CREATE TABLE public.referrals (
    id integer NOT NULL,
    affiliate_id integer,
    product_id integer,
    click_timestamp timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    conversion_timestamp timestamp with time zone,
    sale_amount numeric(10,2),
    commission_amount numeric(10,2),
    referral_code character varying(255),
    status character varying(50),
    ip_address character varying(50),
    user_agent character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.referrals;
       public         heap r       postgres    false            �            1259    41469    referrals_id_seq    SEQUENCE     �   CREATE SEQUENCE public.referrals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.referrals_id_seq;
       public               postgres    false    218            �           0    0    referrals_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.referrals_id_seq OWNED BY public.referrals.id;
          public               postgres    false    217                       2604    41547 
   account id    DEFAULT     h   ALTER TABLE ONLY public.account ALTER COLUMN id SET DEFAULT nextval('public.account_id_seq'::regclass);
 9   ALTER TABLE public.account ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    220    219    220                       2604    41473    referrals id    DEFAULT     l   ALTER TABLE ONLY public.referrals ALTER COLUMN id SET DEFAULT nextval('public.referrals_id_seq'::regclass);
 ;   ALTER TABLE public.referrals ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    217    218    218            �          0    41544    account 
   TABLE DATA           �   COPY public.account (id, fname, lname, email, password, img_url, referral_code, task_id, referred_by_user_id, balance, telegram_username, telegram_user_id, verified, tasks_completed) FROM stdin;
    public               postgres    false    220   c       �          0    41470 	   referrals 
   TABLE DATA           �   COPY public.referrals (id, affiliate_id, product_id, click_timestamp, conversion_timestamp, sale_amount, commission_amount, referral_code, status, ip_address, user_agent, created_at, updated_at) FROM stdin;
    public               postgres    false    218   �       �           0    0    account_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.account_id_seq', 49, true);
          public               postgres    false    219            �           0    0    referrals_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.referrals_id_seq', 1, false);
          public               postgres    false    217            !           2606    41578    account account_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.account DROP CONSTRAINT account_pkey;
       public                 postgres    false    220            #           2606    49748 %   account account_telegram_username_key 
   CONSTRAINT     m   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_telegram_username_key UNIQUE (telegram_username);
 O   ALTER TABLE ONLY public.account DROP CONSTRAINT account_telegram_username_key;
       public                 postgres    false    220                       2606    41480    referrals referrals_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.referrals DROP CONSTRAINT referrals_pkey;
       public                 postgres    false    218            $           2606    49741 (   account account_referred_by_user_id_fkey 
   FK CONSTRAINT     �   ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_referred_by_user_id_fkey FOREIGN KEY (referred_by_user_id) REFERENCES public.account(id);
 R   ALTER TABLE ONLY public.account DROP CONSTRAINT account_referred_by_user_id_fkey;
       public               postgres    false    4641    220    220            �   o  x���Mo7����R��p���d4�/mrH�C�\�_�m�")A��;���,9�
Av�Y��ABֲ���^���A���W�OO�׷+�[^�����#��8��û�`� 
3$�.T#�e��]˒{<^�������>�Hs�r}���u�}U��x+�nC#4ҠhM�%���T�]v� ��38
 9
,���cg�l��R�}b�?�y{wn�6E����\��!�./�)�	=HcN�����9/��4�S�1z���J��W1-X]j(հ�ͤ
�)}R��1�i�n���/���F%Js�YR�����@��c�o�;m��2�NV����T�i�*5�:3�`|�M��+y?]wDő
迨�§�	)=CY���z2$vYѯ
��8.�`#2�v�l3�іNM�|8	��{=�s:ev����Ɂ4,L	0Q�ѝ!��'�"r�I�aշ��0�x�����b�ʒ��u/=�i�n��U8�R�:����c5�z-Tpч:9־p,�gy���7�	{�qDi8C7��r���W��l>����\���Ͷ<��z����LZǷ9e�]Z������5�ٖd��GE&��Dr�:�|F�v]8�c�����e-�.�rQ7Ū3HE�����p��})�X�J������/���Un�l���'�B�@�����w�G��Og��&m|���-'�6����7m������kψ;�.W��@���j:p��4.��BN��cO����H>�]�^-��F�s��ZMTv����P��*x�����Z>I#����!$�$|U�#�peuU����sI�}��0CGfƣv|e��@�}c�1QI�v��S�TG���'�3�9��V�e���B?��z�ڮeq}W�O�:Ѧ+ h���>��g�(�K,�&צ�:�d��t���nu�?�������j J�4�{u1��b��}q�u��ϋ�yq�o?���
0�ɌZ꣸�]�	���T��ЙV�yL�#o�B���P�8��{��T݅ ���P4K(o������7���s3�_��ܼ}�|*+���(�~�LQ��gNlH*ry~���h­,�?~^��8�XKA������翔ФT�d-e��q�;./..��	      �   
   x������ � �     