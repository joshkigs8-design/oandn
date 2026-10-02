import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
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
import { KENYA_COUNTIES } from "@/lib/kenya-locations";
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
  image: "/images/catalog/on-real-45.jpeg",
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
  const [newCategory, setNewCategory] = useState({ name: "", image: "/images/catalog/on-real-45.jpeg" });
  const [savingCategory, setSavingCategory] = useState(false);

  // Orders Management & Invoice State
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<OrderRow | null>(null);
  const [isCreateInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [savingNewInvoice, setSavingNewInvoice] = useState(false);
  type InvoiceItem = {
    productId: string;
    name: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
  };

  const [newInvoiceData, setNewInvoiceData] = useState<{
    fullName: string;
    phone: string;
    email: string;
    address: string;
    town: string;
    county: string;
    instructions: string;
    paymentMethod: string;
    paymentStatus: string;
    mpesaReceiptNumber: string;
    deliveryFee: number;
    items: InvoiceItem[];
  }>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    town: "Kilimani",
    county: "Nairobi",
    instructions: "",
    paymentMethod: "mpesa",
    paymentStatus: "paid",
    mpesaReceiptNumber: "",
    deliveryFee: 0,
    items: [
      {
        productId: "on-plain-hoodie-beige",
        name: "O&N Plain Heavyweight Hoodie — Camel Beige",
        size: "M",
        color: "Camel",
        price: 3000,
        quantity: 1,
      },
    ],
  });

  const handlePrintInvoice = (elementId: string, invoiceNum: string) => {
    const content = document.getElementById(elementId);
    if (!content) {
      window.print();
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <base href="${window.location.origin}/">
          <title>${invoiceNum} - O&N FITS</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #111827;
            }
            body {
              background: #ffffff;
              padding: 10px;
              font-size: 12px;
              line-height: 1.45;
            }
            .invoice-wrapper {
              max-width: 800px;
              margin: 0 auto;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            th {
              background: #f4f4f5;
              padding: 8px 10px;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              text-align: left;
              border-bottom: 2px solid #e4e4e7;
              color: #52525b;
            }
            td {
              padding: 9px 10px;
              border-bottom: 1px solid #f4f4f5;
              font-size: 11px;
            }
            .border-b { border-bottom: 1px solid #e4e4e7; }
            .border-t { border-top: 1px solid #e4e4e7; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
            .text-muted { color: #71717a; }
            .gold-deep { color: #8A6D3B; }
          </style>
        </head>
        <body>
          <div class="invoice-wrapper">
            ${content.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    const triggerPrint = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    };

    // Ensure all images (including logo.png) are loaded in the iframe before printing
    const imgs = Array.from(doc.images);
    if (imgs.length > 0) {
      let loaded = 0;
      const onDone = () => {
        loaded++;
        if (loaded >= imgs.length) setTimeout(triggerPrint, 150);
      };
      imgs.forEach((img) => {
        if (img.complete) {
          loaded++;
        } else {
          img.onload = onDone;
          img.onerror = onDone;
        }
      });
      if (loaded >= imgs.length) setTimeout(triggerPrint, 150);
    } else {
      setTimeout(triggerPrint, 300);
    }
  };

  // Products Search
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate({ to: "/auth", search: { next: "/admin", mode: "signin" } });
        return;
      }
      const isOwnerEmail =
        !!data.user.email &&
        ["oandnfits23@gmail.com", "joshkigs8@gmail.com"].includes(data.user.email.toLowerCase());

      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: data.user.id,
        _role: "admin",
      });
      if (!cancelled) setStatus(isAdmin || isOwnerEmail ? "ok" : "denied");
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

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoiceData.fullName.trim()) {
      toast.error("Please enter the customer's full name");
      return;
    }
    if (!newInvoiceData.phone.trim()) {
      toast.error("Please enter the customer's phone number");
      return;
    }
    if (newInvoiceData.items.length === 0) {
      toast.error("Please add at least one piece to the invoice");
      return;
    }

    const subtotal = newInvoiceData.items.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0,
    );
    const deliveryFee = Number(newInvoiceData.deliveryFee) || 0;
    const total = subtotal + deliveryFee;

    setSavingNewInvoice(true);
    try {
      const payload = {
        full_name: newInvoiceData.fullName.trim(),
        phone: newInvoiceData.phone.trim(),
        email: newInvoiceData.email.trim() || "walkin@oandnfits.com",
        address: newInvoiceData.address.trim() || "Nairobi In-Store / Direct Dispatch",
        county: newInvoiceData.county,
        town: newInvoiceData.town,
        instructions: newInvoiceData.instructions.trim(),
        items: newInvoiceData.items,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: newInvoiceData.paymentMethod,
        payment_status: newInvoiceData.paymentStatus,
        status: newInvoiceData.paymentStatus === "paid" ? "confirmed" : "pending",
        mpesa_receipt_number: newInvoiceData.mpesaReceiptNumber.trim() || null,
      };

      const { data, error } = await supabase
        .from("orders")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      toast.success("Invoice created successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setCreateInvoiceOpen(false);
      if (data) {
        setSelectedOrderForInvoice(data as OrderRow);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create invoice");
    } finally {
      setSavingNewInvoice(false);
    }
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
    setNewCategory({ name: "", image: "/images/catalog/on-real-45.jpeg" });
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
        image: draft.image || "/images/catalog/on-real-45.jpeg",
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
              variant="gold"
              size="lux"
              onClick={() => {
                setNewInvoiceData({
                  fullName: "",
                  phone: "",
                  email: "",
                  address: "",
                  town: "Kilimani",
                  county: "Nairobi",
                  instructions: "",
                  paymentMethod: "mpesa",
                  paymentStatus: "paid",
                  mpesaReceiptNumber: "",
                  deliveryFee: 0,
                  items: [
                    {
                      productId: products[0]?.slug ?? "piece-1",
                      name: products[0]?.name ?? "O&N Signature Piece",
                      size: "M",
                      color: "Black",
                      price: products[0]?.price ?? 3000,
                      quantity: 1,
                    },
                  ],
                });
                setCreateInvoiceOpen(true);
              }}
            >
              <Plus className="size-3.5 mr-1.5" /> Create New Invoice
            </Button>
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
                  <th className="p-3 font-medium text-right">Invoice / PDF</th>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrderForInvoice(o)}
                          title="Generate & View Commercial Tax Invoice / PDF"
                          className="h-8 text-xs gap-1.5 border-gold/40 text-gold-deep hover:bg-gold/10 hover:border-gold font-medium"
                        >
                          <FileText className="size-3.5" />
                          <span>Invoice / PDF</span>
                        </Button>
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
                            in_stock: Boolean(p.inStock),
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

      {/* Commercial Tax Invoice & PDF Print Modal */}
      {selectedOrderForInvoice ? (
        <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-ink/75 p-4 backdrop-blur-md animate-in fade-in">
          <div className="my-8 w-full max-w-3xl rounded-xs border border-border/80 bg-background shadow-2xl overflow-hidden">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b border-border/80 bg-secondary/50 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <FileText className="size-5 text-gold" />
                <span className="font-serif text-sm font-semibold tracking-wide text-foreground">
                  Commercial Tax Invoice — ON-{selectedOrderForInvoice.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() =>
                    handlePrintInvoice(
                      "on-tax-invoice-content",
                      `INV-ON-${selectedOrderForInvoice.id.slice(0, 8).toUpperCase()}`,
                    )
                  }
                  className="h-8 gap-1.5 text-xs font-medium shadow-sm"
                >
                  <Download className="size-3.5" />
                  <span>Download / Print PDF</span>
                </Button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForInvoice(null)}
                  className="grid size-8 place-items-center rounded-xs text-muted-foreground hover:bg-background hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Close invoice preview"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Printable Invoice Content */}
            <div className="p-6 sm:p-8 max-h-[82vh] overflow-y-auto">
              <div
                id="on-tax-invoice-content"
                className="bg-white text-zinc-900 p-8 sm:p-10 border border-zinc-200 rounded-xs shadow-sm font-sans"
              >
                {/* Invoice Header */}
                <div className="flex flex-wrap items-start justify-between gap-6 border-b border-zinc-200 pb-6">
                  <div className="flex items-center gap-4">
                    <img
                      src="/logo.png"
                      alt="O&N FITS"
                      className="h-14 w-auto object-contain"
                    />
                    <div>
                      <h2 className="font-serif text-2xl font-bold tracking-tight text-zinc-950">
                        O&amp;N FITS APPAREL LTD.
                      </h2>
                      <p className="text-[0.7rem] uppercase tracking-wider text-zinc-500 font-medium">
                        Luxury Streetwear &amp; Bespoke Ready-to-Wear
                      </p>
                      <p className="text-xs text-zinc-600 mt-1">
                        Eldoret, Kenya • oandnfits23@gmail.com • +254 112 854 091
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block rounded-xs bg-zinc-900 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-white mb-2">
                      Commercial Tax Invoice
                    </span>
                    <p className="font-mono text-sm font-bold text-zinc-900">
                      INV-ON-{selectedOrderForInvoice.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Date:{" "}
                      {new Date(selectedOrderForInvoice.created_at).toLocaleDateString("en-KE", {
                        dateStyle: "medium",
                      })}
                    </p>
                    <div className="mt-2">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider",
                          selectedOrderForInvoice.payment_status === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800",
                        )}
                      >
                        Payment: {selectedOrderForInvoice.payment_status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Billed To / Shipping Address Grid */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-zinc-200 pb-6">
                  <div>
                    <span className="text-[0.65rem] uppercase tracking-widest font-bold text-zinc-400 block mb-1">
                      Customer / Billed To
                    </span>
                    <p className="font-bold text-sm text-zinc-950">
                      {selectedOrderForInvoice.full_name}
                    </p>
                    <p className="text-zinc-700 mt-0.5 font-medium">
                      Phone: {selectedOrderForInvoice.phone}
                    </p>
                    <p className="text-zinc-600">{selectedOrderForInvoice.email}</p>
                  </div>

                  <div>
                    <span className="text-[0.65rem] uppercase tracking-widest font-bold text-zinc-400 block mb-1">
                      Courier Dispatch Address
                    </span>
                    <p className="text-zinc-800 font-medium">{selectedOrderForInvoice.address}</p>
                    <p className="text-zinc-600">
                      {selectedOrderForInvoice.town}, {selectedOrderForInvoice.county} County
                    </p>
                    <p className="text-zinc-500">Republic of Kenya</p>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="mt-6">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-zinc-200 bg-zinc-50 text-[0.65rem] uppercase tracking-wider font-semibold text-zinc-600">
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3 text-center">Size</th>
                        <th className="py-2.5 px-3 text-center">Color</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {(Array.isArray(selectedOrderForInvoice.items)
                        ? (selectedOrderForInvoice.items as Array<{
                            name?: string;
                            size?: string;
                            color?: string;
                            quantity?: number;
                            price?: number;
                          }>)
                        : []
                      ).map((item, idx) => {
                        const qty = item.quantity ?? 1;
                        const unitPrice = item.price ?? 0;
                        return (
                          <tr key={idx} className="hover:bg-zinc-50/50">
                            <td className="py-3 px-3 font-medium text-zinc-900">
                              {item.name || "O&N Apparel Piece"}
                            </td>
                            <td className="py-3 px-3 text-center text-zinc-600 font-mono">
                              {item.size ?? "M"}
                            </td>
                            <td className="py-3 px-3 text-center text-zinc-600">
                              {item.color ?? "Standard"}
                            </td>
                            <td className="py-3 px-3 text-right text-zinc-700">
                              {formatKES(unitPrice)}
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-zinc-900">
                              {qty}
                            </td>
                            <td className="py-3 px-3 text-right font-semibold text-zinc-950">
                              {formatKES(unitPrice * qty)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Financial Totals Breakdown */}
                <div className="mt-6 flex flex-wrap justify-between items-start gap-6 border-t border-zinc-200 pt-6">
                  <div className="max-w-xs text-xs space-y-2">
                    <span className="text-[0.65rem] uppercase tracking-widest font-bold text-zinc-400 block">
                      Payment Reconciliation
                    </span>
                    <div className="rounded-xs bg-zinc-50 p-3 border border-zinc-200/80 space-y-1">
                      <p className="text-zinc-700">
                        <span className="font-semibold">Payment:</span>{" "}
                        {selectedOrderForInvoice.payment_method.toUpperCase() === "MPESA"
                          ? "M-PESA (Till: 1673504)"
                          : "Call to Confirm / On Delivery"}
                      </p>
                      <p className="text-zinc-700">
                        <span className="font-semibold">Till Number:</span>{" "}
                        <strong className="text-emerald-700 font-mono">1673504 (O&amp;N FITS)</strong>
                      </p>
                      {selectedOrderForInvoice.mpesa_receipt_number ? (
                        <p className="text-zinc-900 font-mono">
                          <span className="font-semibold font-sans">M-Pesa Ref:</span>{" "}
                          <strong className="text-emerald-700">
                            {selectedOrderForInvoice.mpesa_receipt_number}
                          </strong>
                        </p>
                      ) : (
                        <p className="text-zinc-500 italic">
                          Awaiting customer payment or call confirmation
                        </p>
                      )}
                      <p className="text-zinc-600">
                        <span className="font-semibold">Dispatch Status:</span>{" "}
                        {selectedOrderForInvoice.status.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="w-full sm:w-64 space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-600">
                      <span>Subtotal:</span>
                      <span className="font-medium text-zinc-900">
                        {formatKES(selectedOrderForInvoice.subtotal || selectedOrderForInvoice.total)}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Courier Delivery Fee:</span>
                      <span className="font-medium text-zinc-900">
                        {selectedOrderForInvoice.delivery_fee > 0
                          ? formatKES(selectedOrderForInvoice.delivery_fee)
                          : "Free Delivery"}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-500 text-[0.7rem]">
                      <span>VAT (16% Included):</span>
                      <span>
                        {formatKES(Math.round((selectedOrderForInvoice.total * 16) / 116))}
                      </span>
                    </div>
                    <div className="flex justify-between border-t-2 border-zinc-900 pt-2 text-base font-bold text-zinc-950">
                      <span>Grand Total:</span>
                      <span>{formatKES(selectedOrderForInvoice.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Terms & Sign-off */}
                <div className="mt-8 border-t border-zinc-200 pt-6 text-[0.7rem] text-zinc-500 flex flex-wrap justify-between items-end gap-4">
                  <div>
                    <p className="font-semibold text-zinc-700">
                      Thank you for choosing O&amp;N FITS Kenya.
                    </p>
                    <p className="mt-0.5">
                      Pieces can be exchanged within 7 days in original unworn condition with tags attached.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif italic font-semibold text-zinc-800">
                      Authorized Executive Dispatch
                    </p>
                    <p className="text-[0.65rem] text-zinc-400">O&amp;N FITS • All Rights Reserved</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Close Bar */}
            <div className="flex justify-end gap-3 border-t border-border/80 bg-secondary/50 px-6 py-3">
              <Button
                variant="lux"
                size="sm"
                onClick={() => setSelectedOrderForInvoice(null)}
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Create Custom Invoice Form Modal */}
      {isCreateInvoiceOpen ? (
        <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-ink/75 p-4 backdrop-blur-md animate-in fade-in">
          <div className="my-8 w-full max-w-3xl rounded-xs border border-border/80 bg-card p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Create Commercial Tax Invoice
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Generate an official customer order invoice for walk-ins, phone or corporate sales.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateInvoiceOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="mt-6 space-y-6">
              {/* Optional Prefill Selector from live customer orders */}
              {orders.length > 0 && (
                <div className="rounded-xs border border-gold/40 bg-gold/10 p-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-gold-deep block">
                      ⚡ Quick Prefill from Customer Order:
                    </span>
                    <span className="text-[0.65rem] text-muted-foreground">
                      Select any customer order to automatically prefill all customer and item fields.
                    </span>
                  </div>
                  <select
                    onChange={(e) => {
                      const selected = orders.find((o) => o.id === e.target.value);
                      if (!selected) return;
                      const orderItems = Array.isArray(selected.items)
                        ? (selected.items as Array<{
                            productId?: string;
                            name?: string;
                            size?: string;
                            color?: string;
                            price?: number;
                            quantity?: number;
                          }>).map((it) => ({
                            productId: it.productId ?? "custom",
                            name: it.name ?? "O&N Apparel Piece",
                            size: it.size ?? "M",
                            color: it.color ?? "Black",
                            price: Number(it.price) || 3000,
                            quantity: Number(it.quantity) || 1,
                          }))
                        : [];

                      setNewInvoiceData({
                        fullName: selected.full_name,
                        phone: selected.phone,
                        email: selected.email,
                        address: selected.address,
                        town: selected.town,
                        county: selected.county,
                        instructions: "",
                        paymentMethod: selected.payment_method,
                        paymentStatus: selected.payment_status,
                        mpesaReceiptNumber: selected.mpesa_receipt_number ?? "",
                        deliveryFee: selected.delivery_fee,
                        items: orderItems.length > 0 ? orderItems : newInvoiceData.items,
                      });
                      toast.success(`Prefilled from order ON-${selected.id.slice(0, 8).toUpperCase()}`);
                    }}
                    defaultValue=""
                    className="border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="" disabled>
                      Choose order to prefill...
                    </option>
                    {orders.slice(0, 30).map((o) => (
                      <option key={o.id} value={o.id}>
                        ON-{o.id.slice(0, 8).toUpperCase()} — {o.full_name} ({formatKES(o.total)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Customer Information */}
              <div>
                <h4 className="text-[0.7rem] uppercase tracking-widest font-semibold text-gold mb-3">
                  1. Customer &amp; Dispatch Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full Name *">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Victor Mwangi"
                      value={newInvoiceData.fullName}
                      onChange={(e) =>
                        setNewInvoiceData({ ...newInvoiceData, fullName: e.target.value })
                      }
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Phone Number *">
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0712 345 678"
                      value={newInvoiceData.phone}
                      onChange={(e) =>
                        setNewInvoiceData({ ...newInvoiceData, phone: e.target.value })
                      }
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Email Address">
                    <input
                      type="email"
                      placeholder="e.g. customer@example.com"
                      value={newInvoiceData.email}
                      onChange={(e) =>
                        setNewInvoiceData({ ...newInvoiceData, email: e.target.value })
                      }
                      className={inputCls}
                    />
                  </Field>

                  <Field label="County">
                    <select
                      value={newInvoiceData.county}
                      onChange={(e) =>
                        setNewInvoiceData({ ...newInvoiceData, county: e.target.value })
                      }
                      className={inputCls}
                    >
                      {KENYA_COUNTIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Town / Estate">
                    <input
                      type="text"
                      placeholder="e.g. Kilimani / Westlands"
                      value={newInvoiceData.town}
                      onChange={(e) =>
                        setNewInvoiceData({ ...newInvoiceData, town: e.target.value })
                      }
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Street / Landmark Address">
                    <input
                      type="text"
                      placeholder="e.g. Galana Rd, Suite 4B"
                      value={newInvoiceData.address}
                      onChange={(e) =>
                        setNewInvoiceData({ ...newInvoiceData, address: e.target.value })
                      }
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Delivery Notes / Instructions" wide>
                    <input
                      type="text"
                      placeholder="e.g. Call upon arrival or leave with concierge"
                      value={newInvoiceData.instructions}
                      onChange={(e) =>
                        setNewInvoiceData({ ...newInvoiceData, instructions: e.target.value })
                      }
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-border/70 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[0.7rem] uppercase tracking-widest font-semibold text-gold">
                    2. Line Items ({newInvoiceData.items.length})
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const firstP = products[0];
                      setNewInvoiceData({
                        ...newInvoiceData,
                        items: [
                          ...newInvoiceData.items,
                          {
                            productId: firstP?.slug ?? `custom-${Date.now()}`,
                            name: firstP?.name ?? "Custom O&N Apparel",
                            size: "M",
                            color: "Black",
                            price: firstP?.price ?? 3000,
                            quantity: 1,
                          },
                        ],
                      });
                    }}
                    className="h-7 text-xs border-gold/40 text-gold-deep hover:bg-gold/10"
                  >
                    <Plus className="size-3 mr-1" /> Add Another Piece
                  </Button>
                </div>

                <div className="space-y-3">
                  {newInvoiceData.items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 p-3 bg-secondary/30 border border-border/60 rounded-xs items-center"
                    >
                      <div className="col-span-12 sm:col-span-5">
                        <label className="text-[0.6rem] uppercase tracking-wider text-muted-foreground block mb-1">
                          Product Piece
                        </label>
                        <select
                          value={item.productId}
                          onChange={(e) => {
                            const selectedProd = products.find((p) => p.slug === e.target.value);
                            const updated: InvoiceItem[] = [...newInvoiceData.items];
                            if (selectedProd) {
                              updated[index] = {
                                ...item,
                                productId: selectedProd.slug,
                                name: selectedProd.name,
                                price: selectedProd.price,
                              };
                            } else {
                              updated[index] = {
                                ...item,
                                productId: e.target.value,
                              };
                            }
                            setNewInvoiceData({ ...newInvoiceData, items: updated });
                          }}
                          className="w-full border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                        >
                          {products.map((p) => (
                            <option key={p.slug} value={p.slug}>
                              {p.name} — {formatKES(p.price)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="text-[0.6rem] uppercase tracking-wider text-muted-foreground block mb-1">
                          Size
                        </label>
                        <select
                          value={item.size}
                          onChange={(e) => {
                            const updated: InvoiceItem[] = [...newInvoiceData.items];
                            updated[index] = { ...item, size: e.target.value };
                            setNewInvoiceData({ ...newInvoiceData, items: updated });
                          }}
                          className="w-full border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                        >
                          {["XS", "S", "M", "L", "XL", "XXL", "3XL"].map((sz) => (
                            <option key={sz} value={sz}>
                              {sz}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="text-[0.6rem] uppercase tracking-wider text-muted-foreground block mb-1">
                          Qty
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated: InvoiceItem[] = [...newInvoiceData.items];
                            updated[index] = {
                              ...item,
                              quantity: Math.max(1, parseInt(e.target.value) || 1),
                            };
                            setNewInvoiceData({ ...newInvoiceData, items: updated });
                          }}
                          className="w-full border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                        />
                      </div>

                      <div className="col-span-3 sm:col-span-2">
                        <label className="text-[0.6rem] uppercase tracking-wider text-muted-foreground block mb-1">
                          Price (KES)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={item.price}
                          onChange={(e) => {
                            const updated: InvoiceItem[] = [...newInvoiceData.items];
                            updated[index] = {
                              ...item,
                              price: Number(e.target.value) || 0,
                            };
                            setNewInvoiceData({ ...newInvoiceData, items: updated });
                          }}
                          className="w-full border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                        />
                      </div>

                      <div className="col-span-1 flex justify-center pt-4 sm:pt-4">
                        {newInvoiceData.items.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = newInvoiceData.items.filter((_, i) => i !== index);
                              setNewInvoiceData({ ...newInvoiceData, items: updated });
                            }}
                            className="text-muted-foreground hover:text-destructive p-1"
                            title="Remove Piece"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details & Total Preview */}
              <div className="border-t border-border/70 pt-6">
                <h4 className="text-[0.7rem] uppercase tracking-widest font-semibold text-gold mb-3">
                  3. Payment Method &amp; Delivery Fee
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Payment Method">
                    <select
                      value={newInvoiceData.paymentMethod}
                      onChange={(e) =>
                        setNewInvoiceData({ ...newInvoiceData, paymentMethod: e.target.value })
                      }
                      className={inputCls}
                    >
                      <option value="mpesa">M-Pesa (Till / STK)</option>
                      <option value="card">Visa / Mastercard</option>
                      <option value="cash">Cash on Delivery</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </Field>

                  <Field label="Payment Status">
                    <select
                      value={newInvoiceData.paymentStatus}
                      onChange={(e) =>
                        setNewInvoiceData({ ...newInvoiceData, paymentStatus: e.target.value })
                      }
                      className={inputCls}
                    >
                      <option value="paid">PAID (Confirmed)</option>
                      <option value="pending">PENDING (Unpaid)</option>
                    </select>
                  </Field>

                  <Field label="M-Pesa Receipt Ref">
                    <input
                      type="text"
                      placeholder="e.g. SK4829J10K"
                      value={newInvoiceData.mpesaReceiptNumber}
                      onChange={(e) =>
                        setNewInvoiceData({
                          ...newInvoiceData,
                          mpesaReceiptNumber: e.target.value.toUpperCase(),
                        })
                      }
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Delivery Fee (KES)">
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={newInvoiceData.deliveryFee}
                      onChange={(e) =>
                        setNewInvoiceData({
                          ...newInvoiceData,
                          deliveryFee: Number(e.target.value) || 0,
                        })
                      }
                      className={inputCls}
                    />
                  </Field>

                  <div className="sm:col-span-2 flex flex-col justify-end bg-secondary/40 p-3 rounded-xs border border-border/70">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-foreground">
                        {formatKES(
                          newInvoiceData.items.reduce(
                            (s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1),
                            0,
                          ),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Delivery:</span>
                      <span className="font-semibold text-foreground">
                        {formatKES(newInvoiceData.deliveryFee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-foreground border-t border-border/80 pt-2 mt-2">
                      <span>Grand Total:</span>
                      <span className="text-gold-deep">
                        {formatKES(
                          newInvoiceData.items.reduce(
                            (s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1),
                            0,
                          ) + Number(newInvoiceData.deliveryFee || 0),
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 border-t border-border/70 pt-6">
                <Button
                  type="button"
                  variant="lux"
                  size="lux"
                  onClick={() => setCreateInvoiceOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="lux"
                  disabled={savingNewInvoice}
                >
                  {savingNewInvoice ? "Generating Invoice…" : "Save & Generate Invoice"}
                </Button>
              </div>
            </form>
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
