import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Filter,
  LogOut,
  Package,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatKES, swatchPalette, type Swatch } from "@/lib/catalog";
import { fetchProducts } from "@/lib/use-products";
import { fetchCategories } from "@/lib/use-categories";
import type { Product } from "@/lib/catalog";
import { fetchAnnouncement } from "@/lib/site-settings";
import { AVAILABLE_DISCOUNTS } from "@/lib/discounts";
import { cn } from "@/lib/utils";

type OrderRow = {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  county: string;
  town: string;
  items: unknown;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  payment_status: string;
  mpesa_receipt_number: string | null;
  status: string;
};

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

async function fetchOrders(): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, created_at, full_name, phone, email, address, county, town, items, total, subtotal, delivery_fee, payment_method, payment_status, mpesa_receipt_number, status",
    )
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) throw error;
  return (data ?? []) as OrderRow[];
}

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Executive Portal — O&N" },
      {
        name: "description",
        content: "Executive operations dashboard and product catalogue management.",
      },
      { property: "og:title", content: "Admin Executive Portal — O&N" },
      {
        property: "og:description",
        content: "Executive operations dashboard and product catalogue management.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Draft = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  sizes: string;
  colors: Swatch[];
  in_stock: boolean;
  is_new: boolean;
  featured: boolean;
};

const emptyDraft: Draft = {
  slug: "",
  name: "",
  description: "",
  price: 0,
  category: "hoodies",
  image: "/assets/cat-hoodies.jpg",
  sizes: "S, M, L, XL, XXL",
  colors: [],
  in_stock: true,
  is_new: true,
  featured: false,
};

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"loading" | "denied" | "ok">("loading");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [customColor, setCustomColor] = useState({ name: "", hex: "#A8CCE4" });
  const [announcement, setAnnouncement] = useState({ value: "", enabled: true });
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", image: "/assets/cat-hoodies.jpg" });
  const [savingCategory, setSavingCategory] = useState(false);

  // Orders Management & Filter State
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState<OrderRow | null>(null);

  // Products Search
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate({ to: "/auth" });
        return;
      }
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: data.user.id,
        _role: "admin",
      });
      if (!cancelled) setStatus(isAdmin ? "ok" : "denied");
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    enabled: status === "ok",
  });

  const { data: announcementRow } = useQuery({
    queryKey: ["announcement"],
    queryFn: fetchAnnouncement,
    enabled: status === "ok",
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    enabled: status === "ok",
  });

  const {
    data: orders = [],
    isLoading: ordersLoading,
    isFetching: ordersFetching,
  } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: fetchOrders,
    enabled: status === "ok",
    refetchInterval: 25000,
  });

  // Analytics Metrics
  const analytics = useMemo(() => {
    const totalRev = orders.reduce((sum, o) => (o.status !== "cancelled" ? sum + o.total : sum), 0);
    const validOrders = orders.filter((o) => o.status !== "cancelled");
    const aov = validOrders.length > 0 ? Math.round(totalRev / validOrders.length) : 0;
    const pendingOrders = orders.filter(
      (o) => o.status === "pending" || o.status === "confirmed",
    ).length;
    const soldOutCount = products.filter((p) => !p.inStock).length;
    return {
      totalRevenue: totalRev,
      ordersCount: orders.length,
      aov,
      pendingCount: pendingOrders,
      productsCount: products.length,
      soldOutCount,
    };
  }, [orders, products]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (
        orderStatusFilter !== "all" &&
        o.status.toLowerCase() !== orderStatusFilter.toLowerCase()
      ) {
        return false;
      }
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase().trim();
        const matchName = o.full_name?.toLowerCase().includes(q);
        const matchPhone = o.phone?.toLowerCase().includes(q);
        const matchEmail = o.email?.toLowerCase().includes(q);
        const matchReceipt = o.mpesa_receipt_number?.toLowerCase().includes(q);
        const matchId = o.id?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchEmail && !matchReceipt && !matchId) return false;
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q),
    );
  }, [products, productSearch]);

  const setOrderStatus = async (id: string, next: string) => {
    const { error } = await supabase.from("orders").update({ status: next }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Order updated to ${next.toUpperCase()}`);
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const addCategory = async () => {
    const name = newCategory.name.trim();
    if (!name) {
      toast.error("Give the category a name");
      return;
    }
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setSavingCategory(true);
    const { error } = await supabase
      .from("categories")
      .insert({ slug, name, image: newCategory.image.trim(), sort_order: categories.length + 1 });
    setSavingCategory(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Category added");
    setNewCategory({ name: "", image: "/assets/cat-hoodies.jpg" });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const removeCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category ${name}?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Category deleted");
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  useEffect(() => {
    if (announcementRow) setAnnouncement(announcementRow);
  }, [announcementRow]);

  const saveAnnouncement = async () => {
    setSavingAnnouncement(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { key: "announcement", value: announcement.value, enabled: announcement.enabled },
        { onConflict: "key" },
      );
    setSavingAnnouncement(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Announcement updated");
    queryClient.invalidateQueries({ queryKey: ["announcement"] });
  };

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["products"] });

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;

    const rawCategory = draft.category.trim();
    const categorySlug =
      rawCategory
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "general";

    // Auto-create category in directory if new collection name was typed
    const categoryExists = categories.some(
      (c) => c.slug === categorySlug || c.name.toLowerCase() === rawCategory.toLowerCase(),
    );
    if (!categoryExists && rawCategory) {
      await supabase.from("categories").insert({
        slug: categorySlug,
        name: rawCategory,
        image: draft.image || "/assets/cat-hoodies.jpg",
        sort_order: categories.length + 1,
      });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    }

    const payload = {
      slug: draft.slug,
      name: draft.name,
      description: draft.description,
      price: Number(draft.price),
      category: categorySlug,
      image: draft.image,
      gallery: [draft.image],
      sizes: draft.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      colors: draft.colors,
      in_stock: draft.in_stock,
      is_new: draft.is_new,
      featured: draft.featured,
    };
    const { error } = draft.id
      ? await supabase.from("products").update(payload).eq("id", draft.id)
      : await supabase.from("products").insert(payload);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(draft.id ? "Product updated" : "Product & Collection saved");
    setDraft(null);
    refresh();
  };

  const removeProduct = async (p: Product) => {
    if (!confirm(`Delete ${p.name}?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Product deleted");
    refresh();
  };

  if (status === "loading") {
    return (
      <p className="py-32 text-center text-sm text-muted-foreground">
        Verifying administrator authorization…
      </p>
    );
  }

  if (status === "denied") {
    return (
      <div className="mx-auto max-w-md px-5 py-32 text-center">
        <h1 className="font-serif text-4xl">Admin Authorization Required</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This account is not configured as an administrator.
        </p>
        <Button variant="lux" size="lux" className="mt-8" asChild>
          <Link to="/">Back to Storefront</Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-12 lg:px-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <p className="eyebrow">Executive Suite</p>
            <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[0.65rem] font-semibold text-gold-deep">
              Live Production
            </span>
          </div>
          <h1 className="mt-2 font-serif text-4xl lg:text-5xl">Admin Portal</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="gold" size="lux" onClick={() => setDraft(emptyDraft)}>
            <Plus className="size-4 mr-1" strokeWidth={1.5} /> Add New Piece
          </Button>
          <Button
            variant="lux"
            size="lux"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
          >
            <LogOut className="size-4 mr-1" strokeWidth={1.5} /> Sign out
          </Button>
        </div>
      </div>

      {/* Analytics KPI Overview Cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="border border-border/80 bg-card p-5 rounded-xs shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[0.65rem] uppercase tracking-wider font-semibold">
              Gross Revenue
            </span>
            <DollarSign className="size-4 text-gold" />
          </div>
          <p className="mt-3 font-serif text-2xl sm:text-3xl text-foreground font-medium">
            {formatKES(analytics.totalRevenue)}
          </p>
          <p className="mt-1 text-[0.7rem] text-muted-foreground">
            From confirmed &amp; delivered orders
          </p>
        </div>

        {/* Orders Total */}
        <div className="border border-border/80 bg-card p-5 rounded-xs shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[0.65rem] uppercase tracking-wider font-semibold">
              Total Orders
            </span>
            <ShoppingBag className="size-4 text-gold" />
          </div>
          <p className="mt-3 font-serif text-2xl sm:text-3xl text-foreground font-medium">
            {analytics.ordersCount}
          </p>
          <p className="mt-1 text-[0.7rem] text-muted-foreground">
            {analytics.pendingCount} requiring dispatch
          </p>
        </div>

        {/* Average Order Value */}
        <div className="border border-border/80 bg-card p-5 rounded-xs shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[0.65rem] uppercase tracking-wider font-semibold">
              Average Order (AOV)
            </span>
            <TrendingUp className="size-4 text-gold" />
          </div>
          <p className="mt-3 font-serif text-2xl sm:text-3xl text-foreground font-medium">
            {formatKES(analytics.aov)}
          </p>
          <p className="mt-1 text-[0.7rem] text-muted-foreground">Per completed customer order</p>
        </div>

        {/* Active Products */}
        <div className="border border-border/80 bg-card p-5 rounded-xs shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[0.65rem] uppercase tracking-wider font-semibold">
              Catalogue Items
            </span>
            <Package className="size-4 text-gold" />
          </div>
          <p className="mt-3 font-serif text-2xl sm:text-3xl text-foreground font-medium">
            {analytics.productsCount}
          </p>
          <p className="mt-1 text-[0.7rem] text-muted-foreground">
            {analytics.soldOutCount} marked sold out
          </p>
        </div>
      </div>

      {/* Orders Management Section */}
      <div className="mt-10 border border-border/70 bg-card p-6 rounded-xs shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-4">
          <div>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-foreground">
              Order Fulfillment &amp; Dispatch ({filteredOrders.length}{" "}
              {filteredOrders.length === 1 ? "order" : "orders"})
            </h2>
            <p className="text-xs text-muted-foreground">
              Real-time synchronization with Safaricom Daraja STK Push &amp; Courier Logistics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="lux"
              size="lux"
              disabled={ordersFetching}
              onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-orders"] })}
            >
              <RefreshCw className={cn("size-3.5 mr-1.5", ordersFetching && "animate-spin")} />{" "}
              Refresh
            </Button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Search by customer name, phone, email, M-Pesa receipt, or order ID..."
              className="w-full border border-border bg-background py-2 pl-9 pr-4 text-xs outline-none focus:border-gold"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-gold" />
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="border border-border bg-background px-3 py-2 text-xs outline-none focus:border-gold cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        {ordersLoading ? (
          <p className="mt-6 text-sm text-muted-foreground text-center py-12">Loading orders…</p>
        ) : filteredOrders.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground text-center py-12">
            No orders found matching filters.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-secondary text-[0.62rem] tracking-[0.2em] uppercase font-semibold">
                <tr>
                  <th className="p-3 font-medium">Placed</th>
                  <th className="p-3 font-medium">Customer Details</th>
                  <th className="p-3 font-medium">Items Ordered</th>
                  <th className="p-3 font-medium">Total</th>
                  <th className="p-3 font-medium">Payment</th>
                  <th className="p-3 font-medium">Dispatch Status</th>
                  <th className="p-3 font-medium text-right">Slip</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => {
                  const lines = Array.isArray(o.items)
                    ? (o.items as Array<{
                        name?: string;
                        quantity?: number;
                        size?: string;
                        color?: string;
                        price?: number;
                      }>)
                    : [];
                  return (
                    <tr
                      key={o.id}
                      className="border-t border-border/70 align-top hover:bg-background/40 transition-colors"
                    >
                      <td className="p-3 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground block">
                          ON-{o.id.slice(0, 8).toUpperCase()}
                        </span>
                        {new Date(o.created_at).toLocaleDateString("en-KE", { dateStyle: "short" })}
                        <span className="block text-[0.65rem]">
                          {new Date(o.created_at).toLocaleTimeString("en-KE", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="block font-medium text-foreground">{o.full_name}</span>
                        <span className="block text-xs text-gold-deep">{o.phone}</span>
                        <span className="block text-[0.7rem] text-muted-foreground">{o.email}</span>
                        <span className="block text-xs text-muted-foreground mt-1">
                          {o.address}, {o.town}, {o.county}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {lines.map((l, i) => (
                          <span key={i} className="block text-foreground">
                            {l.name} ({l.size ?? "M"} · {l.color ?? "Default"}) ×{" "}
                            <strong>{l.quantity}</strong>
                          </span>
                        ))}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-foreground">{formatKES(o.total)}</span>
                      </td>
                      <td className="p-3 text-xs">
                        <span className="block uppercase font-medium text-foreground">
                          {o.payment_method}
                        </span>
                        {o.mpesa_receipt_number ? (
                          <span className="block font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                            {o.mpesa_receipt_number}
                          </span>
                        ) : (
                          <span className="block text-muted-foreground">{o.payment_status}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <select
                          value={o.status}
                          onChange={(e) => setOrderStatus(o.id, e.target.value)}
                          className={cn(
                            "border px-2.5 py-1.5 text-xs outline-none focus:border-gold cursor-pointer rounded-xs font-medium uppercase",
                            o.status === "confirmed" || o.status === "delivered"
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                              : o.status === "shipped"
                                ? "bg-blue-500/10 text-blue-700 border-blue-500/30"
                                : o.status === "cancelled"
                                  ? "bg-destructive/10 text-destructive border-destructive/30"
                                  : "bg-amber-500/10 text-amber-700 border-amber-500/30",
                          )}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForSlip(o)}
                          aria-label="View delivery packing slip"
                          title="Generate Rider Packing Slip"
                          className="p-1.5 text-muted-foreground hover:text-gold-deep border border-border hover:border-gold rounded-xs"
                        >
                          <Printer className="size-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Catalogue Management Section */}
      <div className="mt-10 border border-border/70 bg-card p-6 rounded-xs shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-4">
          <h2 className="text-xs uppercase tracking-widest font-semibold text-foreground">
            Product Catalogue Management ({filteredProducts.length} items)
          </h2>
          <div className="flex items-center gap-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products..."
              className="border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-gold"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-secondary text-[0.62rem] tracking-[0.2em] uppercase font-semibold">
              <tr>
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Status &amp; Flags</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-border/70 hover:bg-background/40 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt=""
                        className="size-12 object-cover rounded-xs border border-border"
                      />
                      <div>
                        <span className="font-medium text-foreground block">{p.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{p.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground uppercase text-xs">{p.category}</td>
                  <td className="p-4 font-semibold">{formatKES(p.price)}</td>
                  <td className="p-4 text-xs">
                    <span
                      className={cn(
                        "inline-block px-2 py-0.5 rounded text-[0.65rem] font-semibold uppercase",
                        p.inStock
                          ? "bg-emerald-500/15 text-emerald-700"
                          : "bg-destructive/15 text-destructive",
                      )}
                    >
                      {p.inStock ? "In Stock" : "Sold Out"}
                    </span>
                    {p.isNew ? (
                      <span className="ml-1.5 text-gold-deep font-semibold">· New</span>
                    ) : null}
                    {p.featured ? (
                      <span className="ml-1.5 text-foreground font-semibold">· Featured</span>
                    ) : null}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        aria-label={`Edit ${p.name}`}
                        onClick={() =>
                          setDraft({
                            id: p.id,
                            slug: p.slug,
                            name: p.name,
                            description: p.description,
                            price: p.price,
                            category: p.category,
                            image: p.image,
                            sizes: p.sizes.join(", "),
                            colors: p.colors ?? [],
                            in_stock: p.inStock,
                            is_new: !!p.isNew,
                            featured: !!p.featured,
                          })
                        }
                        className="grid size-8 cursor-pointer place-items-center border border-border hover:border-gold hover:text-gold-deep transition-colors rounded-xs"
                      >
                        <Pencil className="size-3.5" strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${p.name}`}
                        onClick={() => removeProduct(p)}
                        className="grid size-8 cursor-pointer place-items-center border border-border hover:border-destructive hover:text-destructive transition-colors rounded-xs"
                      >
                        <Trash2 className="size-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promos & Discounts Section */}
      <div className="mt-10 border border-border/70 bg-card p-6 rounded-xs shadow-sm">
        <h2 className="text-xs uppercase tracking-widest font-semibold text-foreground">
          Active Promotional Discount Codes
        </h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AVAILABLE_DISCOUNTS.map((disc) => (
            <div key={disc.code} className="border border-border/80 bg-background p-4 rounded-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-gold-deep">{disc.code}</span>
                <span className="rounded bg-gold/15 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider font-semibold">
                  {disc.type === "percentage"
                    ? `${disc.value}% OFF`
                    : disc.type === "fixed"
                      ? `KES ${disc.value} OFF`
                      : "FREE SHIPPING"}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{disc.description}</p>
              {disc.minOrder ? (
                <p className="mt-1 text-[0.65rem] text-muted-foreground">
                  Min Order: {formatKES(disc.minOrder)}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Announcement Bar Settings */}
      <div className="mt-10 border border-border/70 bg-card p-6 rounded-xs shadow-sm">
        <h2 className="text-xs uppercase tracking-widest font-semibold text-foreground">
          Announcement Banner Bar
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <input
            value={announcement.value}
            onChange={(e) => setAnnouncement({ ...announcement, value: e.target.value })}
            placeholder="FREE DELIVERY ON ORDERS ABOVE KES 5,000"
            className="min-w-[280px] flex-1 border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-gold"
          />
          <Toggle
            label="Enable on site"
            checked={announcement.enabled}
            onChange={(v) => setAnnouncement({ ...announcement, enabled: v })}
          />
          <Button
            variant="gold"
            size="lux"
            onClick={saveAnnouncement}
            disabled={savingAnnouncement}
          >
            {savingAnnouncement ? "Saving…" : "Save Announcement"}
          </Button>
        </div>
      </div>

      {/* Categories & Collections Manager */}
      <div className="mt-10 border border-border/70 bg-card p-6 rounded-xs shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-4">
          <div>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-foreground">
              Collections &amp; Categories Directory ({categories.length} active)
            </h2>
            <p className="text-xs text-muted-foreground">
              Add custom collections here or type them on-the-fly when creating products.
            </p>
          </div>
        </div>

        {/* Collection Cards Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((c) => {
            const productCount = products.filter(
              (p) =>
                p.category.toLowerCase() === c.slug.toLowerCase() ||
                p.category.toLowerCase() === c.name.toLowerCase(),
            ).length;
            return (
              <div
                key={c.slug}
                className="group relative overflow-hidden border border-border/80 bg-background rounded-xs shadow-xs hover:border-gold transition-colors"
              >
                <div className="h-24 w-full overflow-hidden bg-secondary">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">{c.name}</h4>
                      <p className="text-[0.65rem] text-muted-foreground font-mono">/{c.slug}</p>
                    </div>
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.6rem] font-bold text-gold-deep">
                      {productCount} {productCount === 1 ? "piece" : "pieces"}
                    </span>
                  </div>

                  {c.id ? (
                    <div className="mt-3 flex justify-end border-t border-border/60 pt-2">
                      <button
                        type="button"
                        onClick={() => removeCategory(c.id!, c.name)}
                        className="text-[0.65rem] text-destructive hover:underline cursor-pointer"
                      >
                        Delete Collection
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Collection Form */}
        <div className="mt-6 border-t border-border/70 pt-5">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Add New Collection / Category
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              placeholder="e.g. Summer Drop 2026, Tracksuits, Outerwear"
              className="min-w-[240px] flex-1 border border-border bg-background px-3 py-2 text-xs outline-none focus:border-gold"
            />
            <input
              value={newCategory.image}
              onChange={(e) => setNewCategory({ ...newCategory, image: e.target.value })}
              placeholder="Collection Banner Image URL"
              className="min-w-[240px] flex-1 border border-border bg-background px-3 py-2 text-xs outline-none focus:border-gold"
            />
            <Button variant="gold" size="lux" onClick={addCategory} disabled={savingCategory}>
              {savingCategory ? "Adding…" : "Create Collection"}
            </Button>
          </div>
        </div>
      </div>

      {/* Product Edit / Create Modal */}
      {draft ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={saveProduct}
            className="max-h-[88vh] w-full max-w-xl overflow-y-auto border border-border bg-card p-7 shadow-2xl rounded-xs"
          >
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <h2 className="font-serif text-3xl">{draft.id ? "Edit Product" : "New Piece"}</h2>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Piece Name">
                <input
                  required
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Slug (URL identifier)">
                <input
                  required
                  value={draft.slug}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Price in KES">
                <input
                  type="number"
                  min={0}
                  required
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                  className={inputCls}
                />
              </Field>

              {/* Typed Category / Collection Input */}
              <Field label="Category / Collection (Type or Select)">
                <div className="space-y-2">
                  <input
                    required
                    list="category-suggestions"
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                    placeholder="Type custom collection name..."
                    className={inputCls}
                  />
                  <datalist id="category-suggestions">
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </datalist>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {categories.slice(0, 6).map((c) => (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => setDraft({ ...draft, category: c.slug })}
                        className={cn(
                          "text-[0.6rem] px-2 py-0.5 border rounded-xs transition-colors cursor-pointer",
                          draft.category === c.slug
                            ? "border-gold bg-gold/20 text-gold-deep font-semibold"
                            : "border-border text-muted-foreground hover:border-gold hover:text-foreground",
                        )}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </Field>

              <Field label="Image URL" wide>
                <input
                  required
                  value={draft.image}
                  onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Sizes (comma separated)" wide>
                <input
                  value={draft.sizes}
                  onChange={(e) => setDraft({ ...draft, sizes: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Available Colours" wide>
                <div className="mt-2 flex flex-wrap gap-2">
                  {swatchPalette.map((s) => {
                    const on = draft.colors.some((c) => c.name === s.name);
                    return (
                      <button
                        key={s.name}
                        type="button"
                        title={s.name}
                        aria-pressed={on}
                        onClick={() =>
                          setDraft({
                            ...draft,
                            colors: on
                              ? draft.colors.filter((c) => c.name !== s.name)
                              : [...draft.colors, s],
                          })
                        }
                        className={cn(
                          "size-7 cursor-pointer rounded-full border-2 transition-all",
                          on ? "border-gold ring-2 ring-gold/40 scale-110" : "border-border",
                        )}
                        style={{ backgroundColor: s.hex }}
                      />
                    );
                  })}
                </div>
              </Field>
              <Field label="Description" wide>
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="mt-5 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <Toggle
                label="In Stock"
                checked={draft.in_stock}
                onChange={(v) => setDraft({ ...draft, in_stock: v })}
              />
              <Toggle
                label="New Arrival"
                checked={draft.is_new}
                onChange={(v) => setDraft({ ...draft, is_new: v })}
              />
              <Toggle
                label="Featured Piece"
                checked={draft.featured}
                onChange={(v) => setDraft({ ...draft, featured: v })}
              />
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-border/70 pt-4">
              <Button type="button" variant="lux" size="lux" onClick={() => setDraft(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="gold" size="lux">
                Save Piece
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Printable Dispatch Packing Slip Modal */}
      {selectedOrderForSlip ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg border border-border bg-white text-black p-8 shadow-2xl rounded-xs">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="O&N FITS" className="h-10 w-auto object-contain" />
                <div>
                  <h3 className="font-serif text-lg font-bold">O&amp;N FITS</h3>
                  <p className="text-[0.65rem] text-gray-500">Dispatch &amp; Rider Delivery Slip</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForSlip(null)}
                className="text-gray-400 hover:text-black"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-semibold block text-gray-500">Order ID:</span>
                <span className="font-mono">
                  ON-{selectedOrderForSlip.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div>
                <span className="font-semibold block text-gray-500">Date:</span>
                <span>{new Date(selectedOrderForSlip.created_at).toLocaleString("en-KE")}</span>
              </div>
              <div className="col-span-2 border-t pt-2">
                <span className="font-semibold block text-gray-500">Recipient:</span>
                <span className="font-bold text-sm block">{selectedOrderForSlip.full_name}</span>
                <span className="block font-semibold text-gray-800">
                  Phone: {selectedOrderForSlip.phone}
                </span>
                <span className="block text-gray-600">
                  {selectedOrderForSlip.address}, {selectedOrderForSlip.town},{" "}
                  {selectedOrderForSlip.county}
                </span>
              </div>
            </div>

            <div className="mt-5 border-t pt-3">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(selectedOrderForSlip.items)
                    ? (selectedOrderForSlip.items as Array<{
                        name?: string;
                        size?: string;
                        quantity?: number;
                        price?: number;
                      }>)
                    : []
                  ).map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">
                        {item.name} ({item.size ?? "M"})
                      </td>
                      <td className="p-2">{item.quantity ?? 1}</td>
                      <td className="p-2 text-right">
                        {item.price ? formatKES(item.price * (item.quantity ?? 1)) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 flex justify-between text-sm font-bold border-t pt-3">
                <span>Total Amount:</span>
                <span>{formatKES(selectedOrderForSlip.total)}</span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Payment Method: {selectedOrderForSlip.payment_method.toUpperCase()} (Status:{" "}
                {selectedOrderForSlip.payment_status})
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
              <Button
                variant="lux"
                size="lux"
                onClick={() => window.print()}
                className="bg-gray-900 text-white hover:bg-black"
              >
                <Printer className="size-4 mr-1.5" /> Print Slip
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

const inputCls =
  "mt-2 w-full border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-gold";

function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={cn("block", wide && "sm:col-span-2")}>
      <span className="text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase font-medium">
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-[oklch(0.72_0.075_78)] cursor-pointer"
      />
      {label}
    </label>
  );
}
