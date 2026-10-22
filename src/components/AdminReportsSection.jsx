import { useCallback, useEffect, useState } from "react";
import { Flag, UserX, XCircle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "./ConfirmModal";
import {
  fetchReport,
  fetchReports,
  rejectReport,
  removeReportedUser,
} from "../services/reportsApi";

const TABS = ["Pending", "Resolved", "Rejected"];

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-800",
  Resolved: "bg-red-100 text-red-700",
  Rejected: "bg-gray-200 text-gray-700",
};

const STATUS_LABELS = { Pending: "Pending", Resolved: "User removed", Rejected: "Rejected" };

function ReportCard({ report, busy, onRemove, onReject }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [evidence, setEvidence] = useState(null);
  const [loadingEvidence, setLoadingEvidence] = useState(false);
  const isPending = report.status === "Pending";

  // The screenshot is large, so it is only fetched when the admin asks to see it.
  const loadEvidence = async () => {
    setLoadingEvidence(true);
    try {
      const { data } = await fetchReport(report._id);
      setEvidence(data.evidenceImage || "");
    } catch (error) {
      showToast(error.message || "Failed to load evidence.", "error");
    } finally {
      setLoadingEvidence(false);
    }
  };

  const reported = report.reportedUser;
  const reporter = report.reporter;

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t("Reported user")}
          </p>
          <p className="truncate font-semibold text-[var(--color-text-primary)]">
            {reported?.fullName || t("Deleted user")}
            {reported?.email && (
              <span className="ml-2 text-xs font-normal text-[var(--color-text-secondary)]">{reported.email}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[var(--color-brand-active-bg)] px-3 py-1 text-xs font-semibold text-[var(--color-brand)]">
            {t(report.category)}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[report.status]}`}>
            {t(STATUS_LABELS[report.status])}
          </span>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-wrap break-words text-sm text-[var(--color-text-primary)]">
        {report.description}
      </p>
      <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
        {t("Reported by")} {reporter?.fullName || t("Unknown user")} · {new Date(report.createdAt).toLocaleString()}
      </p>

      {evidence ? (
        <img
          src={evidence}
          alt={t("Evidence screenshot")}
          className="mt-3 max-h-80 rounded-lg border border-[var(--color-border)] object-contain"
        />
      ) : (
        evidence === null && (
          <button
            type="button"
            onClick={loadEvidence}
            disabled={loadingEvidence}
            className="mt-3 text-sm font-semibold text-[var(--color-brand)] hover:underline disabled:opacity-50"
          >
            {loadingEvidence ? t("Loading…") : t("View evidence")}
          </button>
        )
      )}

      {!isPending && report.reviewedAt && (
        <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
          {t("Reviewed by")} {report.reviewedBy?.fullName || t("an administrator")} · {new Date(report.reviewedAt).toLocaleString()}
        </p>
      )}

      {isPending && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => onRemove(report)}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            <UserX size={16} />
            {t("Remove user")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onReject(report)}
            className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)] disabled:opacity-50"
          >
            <XCircle size={16} />
            {t("Reject report")}
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminReportsSection() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Pending");
  const [busyId, setBusyId] = useState(null);
  const [pendingRemoval, setPendingRemoval] = useState(null);

  const load = useCallback(async () => {
    const { data } = await fetchReports();
    setReports(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    load()
      .catch((error) => showToast(error.message || "Failed to load reports.", "error"))
      .finally(() => setLoading(false));
  }, [load, showToast]);

  const act = async (report, action, successMessage) => {
    setBusyId(report._id);
    try {
      await action(report._id);
      await load();
      showToast(successMessage, "success");
    } catch (error) {
      showToast(error.message || "Action failed.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const confirmRemoval = () => {
    const report = pendingRemoval;
    setPendingRemoval(null);
    if (report) act(report, removeReportedUser, "User removed and report resolved.");
  };

  const counts = Object.fromEntries(TABS.map((s) => [s, reports.filter((r) => r.status === s).length]));
  const visible = reports.filter((r) => r.status === tab);

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Flag size={22} className="text-red-500" />
        <h3 className="text-xl font-bold text-[var(--color-text-primary)]">{t("User Reports")}</h3>
      </div>

      <div className="mb-6 grid grid-cols-3 rounded-2xl bg-gray-200 p-1">
        {TABS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setTab(status)}
            className={`rounded-xl py-1 font-semibold transition-all duration-200 ${
              tab === status
                ? "bg-white text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-secondary)]"
            }`}
          >
            {t(STATUS_LABELS[status])} ({counts[status]})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-10 text-center font-medium text-[var(--color-text-secondary)]">{t("Loading reports...")}</div>
        ) : visible.length === 0 ? (
          <div className="py-10 text-center font-medium text-[var(--color-text-secondary)]">{t("There are no reports here.")}</div>
        ) : (
          visible.map((report) => (
            <ReportCard
              key={report._id}
              report={report}
              busy={busyId === report._id}
              onRemove={setPendingRemoval}
              onReject={(r) => act(r, rejectReport, "Report rejected.")}
            />
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(pendingRemoval)}
        title={t("Remove this user?")}
        message={t("They will be signed out and unable to log in or send messages. All pending reports against them will be resolved.")}
        confirmText="Remove user"
        onConfirm={confirmRemoval}
        onCancel={() => setPendingRemoval(null)}
      />
    </div>
  );
}
