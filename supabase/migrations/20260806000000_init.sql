-- Create kategori table
create table public.kategori (
  id uuid default gen_random_uuid() primary key,
  nama text not null unique
);

-- Create buku table
create table public.buku (
  id uuid default gen_random_uuid() primary key,
  judul text not null,
  pengarang text,
  tahun integer,
  kategori_id uuid references public.kategori(id) on delete restrict,
  jumlah_eksemplar integer not null default 0,
  jumlah_tersedia integer not null default 0,
  keterangan text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create peminjaman table
create table public.peminjaman (
  id uuid default gen_random_uuid() primary key,
  buku_id uuid not null references public.buku(id) on delete restrict,
  nama_siswa text not null,
  kelas text not null,
  tanggal_pinjam date not null default current_date,
  tanggal_jatuh_tempo date not null,
  tanggal_kembali date,
  status text not null check (status in ('dipinjam', 'dikembalikan', 'telat')) default 'dipinjam',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create trigger function to manage book availability (jumlah_tersedia)
create or replace function public.handle_peminjaman_changes()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.buku
    set jumlah_tersedia = jumlah_tersedia - 1
    where id = new.buku_id;
  elsif tg_op = 'UPDATE' then
    -- If tanggal_kembali transitions from NULL to NOT NULL (status changes to 'dikembalikan')
    if old.tanggal_kembali is null and new.tanggal_kembali is not null then
      update public.buku
      set jumlah_tersedia = jumlah_tersedia + 1
      where id = new.buku_id;
    -- If return is undone (tanggal_kembali transitions from NOT NULL to NULL)
    elsif old.tanggal_kembali is not null and new.tanggal_kembali is null then
      update public.buku
      set jumlah_tersedia = jumlah_tersedia - 1
      where id = new.buku_id;
    end if;
  elsif tg_op = 'DELETE' then
    -- If deleted while still borrowed, return the book to stock
    if old.tanggal_kembali is null then
      update public.buku
      set jumlah_tersedia = jumlah_tersedia + 1
      where id = old.buku_id;
    end if;
  END IF;
  return new;
end;
$$ language plpgsql;

-- Attach trigger to peminjaman table
create trigger trg_handle_peminjaman_changes
after insert or update or delete on public.peminjaman
for each row execute function public.handle_peminjaman_changes();

-- Enable Row Level Security (RLS)
alter table public.kategori enable row level security;
alter table public.buku enable row level security;
alter table public.peminjaman enable row level security;

-- Policies for kategori
create policy "Allow public read for kategori" on public.kategori
  for select using (true);

create policy "Allow admin CRUD for kategori" on public.kategori
  for all to authenticated
  using (true)
  with check (true);

-- Policies for buku
create policy "Allow public read for buku" on public.buku
  for select using (true);

create policy "Allow admin CRUD for buku" on public.buku
  for all to authenticated
  using (true)
  with check (true);

-- Policies for peminjaman
create policy "Allow admin CRUD for peminjaman" on public.peminjaman
  for all to authenticated
  using (true)
  with check (true);
