import AuthGate from "@/components/AuthGate";
import CatalogEditorClient from "./CatalogEditorClient";

export default function CourseCatalogAdminPage() {
  return (
    <AuthGate>
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold">Course Catalog Admin</h1>
        <p className="text-sm text-gray-600">
          views.ndjson の view_code を参照しながら、hs_ia の topics(viewCode) を編集します。
        </p>
        <CatalogEditorClient courseId="hs_ia" />
      </div>
    </AuthGate>
  );
}
