import { cookies } from "next/headers";

import { AdminDashboard } from "@/components/admin-dashboard";
import {
  AdminAddAliasForm,
  AdminCreateAgencyForm,
  AdminCreateLocationForm,
  AdminMatchProbe,
} from "@/components/admin-ops-tools";
import { AdminLoginForm } from "@/components/admin-login-form";
import { COOKIE_NAME, verifyAdminToken } from "@/lib/auth/admin-session";
import { adminService, usingSupabase } from "@/lib/container";
import { resolveTipEvidenceUrl } from "@/lib/ops/tip-evidence";
import { resolveReviewEvidenceUrl } from "@/lib/ops/review-evidence";

export const metadata = {
  title: "Administración",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!verifyAdminToken(token)) {
    return (
      <div className="min-h-screen bg-stone-100 px-6 py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold">Panel de administración</h1>
          <p className="mt-2 text-sm text-stone-600">
            Acceso restringido para moderar reseñas y revisar reclamaciones.
          </p>
          <AdminLoginForm />
        </div>
      </div>
    );
  }

  const [claims, reviews, submissions, locations, tips, contentNotices] =
    await Promise.all([
      adminService.listPendingClaims(),
      adminService.listReviewsForModeration(),
      adminService.listPendingAgencySubmissions(),
      adminService.listPendingLocations(),
      adminService.listPendingTips(),
      adminService.listPendingContentNotices(),
    ]);

  const tipsWithEvidence = await Promise.all(
    tips.map(async (tip) => ({
      ...tip,
      evidenceUrl: await resolveTipEvidenceUrl(tip.evidencePath),
    })),
  );
  const reviewsWithEvidence = await Promise.all(
    reviews.map(async (review) => ({
      ...review,
      evidenceUrl: await resolveReviewEvidenceUrl(review.evidencePath),
    })),
  );

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-700">
              Fachada Admin
            </p>
            <h1 className="text-2xl font-semibold">Moderación y claims</h1>
          </div>
          <form action="/api/admin/logout" method="post">
            <button className="rounded-lg border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        {process.env.NODE_ENV !== "production" && (
          <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Almacenamiento:{" "}
            <strong>{usingSupabase() ? "Supabase" : "memoria"}</strong>.
            {!usingSupabase() &&
              " Las sugerencias de inmobiliaria solo existen hasta que reinicies el servidor de desarrollo."}
          </p>
        )}
        <div className="space-y-10">
          <AdminCreateAgencyForm />
          <AdminMatchProbe />
          <AdminAddAliasForm />
          <AdminCreateLocationForm />
          <AdminDashboard
            initialClaims={claims}
            initialReviews={reviewsWithEvidence}
            initialSubmissions={submissions}
            initialLocations={locations}
            initialTips={tipsWithEvidence}
            initialContentNotices={contentNotices}
          />
        </div>
      </main>
    </div>
  );
}
