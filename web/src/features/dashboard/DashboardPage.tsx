import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  IconBot,
  IconFileText,
  IconSidebarConfig,
  IconSidebarLogs,
  IconSidebarQuota,
  IconSidebarSystem,
} from '@/components/ui/icons';
import { useAuthStore } from '@/stores';
import { useHeaderRefresh } from '@/hooks/useHeaderRefresh';
import { useCountUp } from '@/hooks/motion';
import { formatCompactNumber, formatDateValue, formatPercent } from '@/utils/format';
import { useDashboardOverview } from './hooks/useDashboardOverview';
import { ThroughputChart } from './components/ThroughputChart';
import { SignalField } from './components/SignalField';
import { Meter } from './components/Meter';
import { Sparkline } from './components/Sparkline';
import { providerLabel, splitWindowMinutes } from './utils';
import styles from './dashboard.module.scss';

const DASH = '\u2014';
const Arrow = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14m-5-5 5 5-5 5" />
  </svg>
);

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const apiBase = useAuthStore((state) => state.apiBase);
  const serverVersion = useAuthStore((state) => state.serverVersion);
  const serverBuildDate = useAuthStore((state) => state.serverBuildDate);
  const { connectionStatus, connected, config, counts, traffic, providers, credentials, refresh } =
    useDashboardOverview();
  useHeaderRefresh(refresh, connected);
  const animatedTotal = useCountUp(traffic.total, connected);
  const connectionLabel = t(
    connectionStatus === 'connected'
      ? 'common.connected'
      : connectionStatus === 'connecting'
        ? 'common.connecting'
        : 'common.disconnected'
  );
  const windowLabel = useMemo(() => {
    if (traffic.windowMinutes <= 0) return DASH;
    const { hours, minutes } = splitWindowMinutes(traffic.windowMinutes);
    if (!hours) return t('dashboard.window_m', { minutes });
    if (!minutes) return t('dashboard.window_h', { hours });
    return t('dashboard.window_hm', { hours, minutes });
  }, [traffic.windowMinutes, t]);
  const strategy = config?.routingStrategy?.trim() ?? '';
  const routingLabels: Record<string, string> = {
    'round-robin': 'basic_settings.routing_strategy_round_robin',
    'weighted-round-robin': 'basic_settings.routing_strategy_weighted_round_robin',
    'fill-first': 'basic_settings.routing_strategy_fill_first',
  };
  const runtimeRows = [
    [t('dashboard.runtime_routing'), strategy ? t(routingLabels[strategy] || strategy) : DASH],
    [t('dashboard.runtime_retry'), String(config?.requestRetry ?? 0)],
    [
      t('dashboard.runtime_management_keys'),
      counts.managementKeys === null ? DASH : String(counts.managementKeys),
    ],
    [t('dashboard.runtime_version'), serverVersion?.trim() || DASH],
    [t('dashboard.runtime_build'), formatDateValue(serverBuildDate, i18n.language) || DASH],
    [t('dashboard.runtime_proxy'), config?.proxyUrl?.trim() || DASH],
  ];
  const runtimeToggles = config
    ? [
        { label: t('dashboard.runtime_debug'), on: Boolean(config.debug) },
        { label: t('dashboard.runtime_file_logging'), on: Boolean(config.loggingToFile) },
        { label: t('dashboard.runtime_request_log'), on: Boolean(config.requestLog) },
        { label: t('dashboard.runtime_ws_auth'), on: Boolean(config.wsAuth) },
        { label: t('dashboard.runtime_model_prefix'), on: Boolean(config.forceModelPrefix) },
      ]
    : [];
  const metrics = [
    {
      label: t('dashboard.hero_requests_label'),
      value: connected ? formatCompactNumber(animatedTotal) : DASH,
      hint: t('dashboard.hero_window_meta', { window: windowLabel }),
      tone: 'accent',
    },
    {
      label: t('dashboard.success_rate'),
      value: traffic.successRate === null ? DASH : formatPercent(traffic.successRate),
      hint: t('dashboard.stat_success_hint', { total: traffic.total.toLocaleString() }),
      tone: '',
    },
    {
      label: t('dashboard.stat_credentials'),
      value: credentials ? String(credentials.total) : DASH,
      hint: credentials
        ? t('dashboard.stat_credentials_hint', {
            active: credentials.active,
            disabled: credentials.disabled + credentials.unavailable,
          })
        : t('dashboard.stat_credentials_empty'),
      tone: '',
    },
    {
      label: t('dashboard.stat_models'),
      value: counts.models === null ? DASH : String(counts.models),
      hint: t('dashboard.stat_models_hint'),
      tone: '',
    },
  ];
  const actions = [
    {
      to: '/ai-providers',
      icon: <IconBot size={19} />,
      title: t('nav.ai_providers'),
      description: t('dashboard.cta_providers_desc'),
    },
    {
      to: '/auth-files',
      icon: <IconFileText size={19} />,
      title: t('nav.auth_files'),
      description: t('dashboard.cta_auth_files_desc'),
    },
    {
      to: '/config',
      icon: <IconSidebarConfig size={19} />,
      title: t('nav.config_management'),
      description: t('dashboard.cta_config_desc'),
    },
    {
      to: '/quota',
      icon: <IconSidebarQuota size={19} />,
      title: t('nav.quota_management'),
      description: t('dashboard.cta_quota_desc'),
    },
    {
      to: '/logs',
      icon: <IconSidebarLogs size={19} />,
      title: t('nav.logs'),
      description: t('dashboard.cta_logs_desc'),
    },
    {
      to: '/system',
      icon: <IconSidebarSystem size={19} />,
      title: t('nav.system_info'),
      description: t('dashboard.cta_system_desc'),
    },
  ];
  const statusKey = !connected
    ? connectionStatus === 'connecting'
      ? 'hero_verdict_connecting'
      : 'hero_verdict_offline'
    : traffic.total === 0
      ? 'hero_verdict_idle'
      : traffic.successRate !== null && traffic.successRate >= 98
        ? 'hero_verdict_good'
        : 'hero_verdict_warning';

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <div className={styles.overline}>{t('workspace.control_plane')}</div>
          <h1>{t('workspace.overview')}</h1>
          <p>{t('workspace.overview_description')}</p>
        </div>
        <Link to="/config" className={styles.outlineAction}>
          <IconSidebarConfig size={16} />
          {t('dashboard.runtime_link')}
          <Arrow size={15} />
        </Link>
      </header>

      <section className={styles.gateway} aria-label={t('workspace.gateway_status')}>
        <div className={styles.gatewayCopy}>
          <div className={styles.connection}>
            <i className={connected ? styles.online : ''} />
            {connectionLabel}
            <span>{serverVersion ? `v${serverVersion.replace(/^[vV]+/, '')}` : DASH}</span>
          </div>
          <h2>{t(`dashboard.${statusKey}`)}</h2>
          <p>{t('workspace.gateway_description')}</p>
          <code className={styles.endpoint}>{apiBase || DASH}</code>
          <div className={styles.gatewayActions}>
            <Link to="/ai-providers" className={styles.primaryAction}>
              {t('dashboard.cta_manage_providers')}
              <Arrow size={16} />
            </Link>
            <Link to="/logs" className={styles.textAction}>
              {t('dashboard.cta_inspect_logs')}
              <Arrow size={15} />
            </Link>
          </div>
        </div>
        <div className={styles.signal}>
          <div className={styles.signalLabel}>
            <span>{t('workspace.routing_layer')}</span>
            <span>01 / CLI</span>
          </div>
          <SignalField />
          <div className={styles.signalFooter}>
            <span>{t('dashboard.stat_provider_keys')}</span>
            <b>{counts.providerKeys === null ? DASH : counts.providerKeys}</b>
            <span>{t('dashboard.runtime_routing')}</span>
            <b>{strategy ? t(routingLabels[strategy] || strategy) : DASH}</b>
          </div>
        </div>
      </section>

      <section className={styles.metrics} aria-label={t('dashboard.stats_aria')}>
        {metrics.map((metric, index) => (
          <article key={metric.label} className={styles.metric}>
            <div className={styles.metricLabel}>
              <span>{metric.label}</span>
              <span className={styles.metricIndex}>0{index + 1}</span>
            </div>
            <strong className={metric.tone ? styles.accentValue : ''}>{metric.value}</strong>
            <span className={styles.metricHint}>{metric.hint}</span>
          </article>
        ))}
      </section>

      <div className={styles.analysisGrid}>
        <div className={styles.mainColumn}>
          <section className={styles.panel}>
            <header className={styles.panelHeader}>
              <div>
                <span className={styles.overline}>{t('dashboard.traffic_eyebrow')}</span>
                <h2>{t('workspace.request_activity')}</h2>
              </div>
              <span className={styles.quietBadge}>{windowLabel}</span>
            </header>
            <p className={styles.description}>
              {t('dashboard.traffic_description', { window: windowLabel })}
            </p>
            <ThroughputChart traffic={traffic} />
          </section>
          <section className={styles.panel}>
            <header className={styles.panelHeader}>
              <div>
                <span className={styles.overline}>{t('dashboard.fleet_eyebrow')}</span>
                <h2>{t('workspace.provider_fleet')}</h2>
              </div>
              <Link
                to="/ai-providers"
                className={styles.iconLink}
                aria-label={t('nav.ai_providers')}
              >
                <Arrow size={18} />
              </Link>
            </header>
            {providers.length === 0 ? (
              <div className={styles.emptyState}>
                <IconBot size={26} />
                <strong>{t('dashboard.fleet_empty')}</strong>
                <Link to="/ai-providers" className={styles.textAction}>
                  {t('dashboard.cta_manage_providers')}
                  <Arrow size={14} />
                </Link>
              </div>
            ) : (
              <ul className={styles.fleetList}>
                {providers.map((provider) => (
                  <li key={provider.id}>
                    <span className={styles.providerMark}>
                      {providerLabel(provider.id, t('dashboard.provider_unknown')).slice(0, 1)}
                    </span>
                    <div className={styles.fleetIdentity}>
                      <strong>{providerLabel(provider.id, t('dashboard.provider_unknown'))}</strong>
                      <span>
                        {t('dashboard.fleet_credentials', { value: provider.credentials })}
                      </span>
                    </div>
                    <Sparkline
                      points={provider.buckets.map((bucket) => bucket.success + bucket.failed)}
                      ariaLabel={t('dashboard.fleet_spark_label', {
                        provider: providerLabel(provider.id, t('dashboard.provider_unknown')),
                      })}
                      className={styles.fleetSpark}
                    />
                    <div className={styles.fleetNumbers}>
                      <strong>{formatCompactNumber(provider.total)}</strong>
                      <span>{t('dashboard.fleet_requests')}</span>
                    </div>
                    <div className={styles.fleetRate}>
                      <span>
                        {provider.successRate === null ? DASH : formatPercent(provider.successRate)}
                      </span>
                      <Meter value={provider.successRate} ariaLabel={t('dashboard.success_rate')} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        <aside className={styles.sideColumn}>
          <section className={styles.panel}>
            <header className={styles.panelHeader}>
              <div>
                <span className={styles.overline}>{t('dashboard.runtime_eyebrow')}</span>
                <h2>{t('workspace.instance_details')}</h2>
              </div>
              <IconSidebarSystem size={18} />
            </header>
            <dl className={styles.specList}>
              {runtimeRows.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd title={value}>{value}</dd>
                </div>
              ))}
            </dl>
            <ul className={styles.toggleList}>
              {runtimeToggles.map((toggle) => (
                <li key={toggle.label}>
                  <i className={toggle.on ? styles.online : ''} />
                  {toggle.label}
                  <span>{toggle.on ? t('common.yes') : t('common.no')}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className={styles.panel}>
            <header className={styles.panelHeader}>
              <div>
                <span className={styles.overline}>{t('dashboard.health_eyebrow')}</span>
                <h2>{t('dashboard.health_title')}</h2>
              </div>
              <IconFileText size={18} />
            </header>
            <div className={styles.healthCounts}>
              {[
                [t('dashboard.health_active'), credentials?.active],
                [t('dashboard.health_unavailable'), credentials?.unavailable],
                [t('dashboard.health_disabled'), credentials?.disabled],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <strong>{value ?? DASH}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            {credentials && credentials.byType.length > 0 && (
              <ul className={styles.typeList}>
                {credentials.byType.map((entry) => (
                  <li key={entry.type}>
                    {providerLabel(entry.type, t('dashboard.provider_unknown'))}
                    <b>{entry.count}</b>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/auth-files" className={styles.footerLink}>
              {t('dashboard.health_link')}
              <Arrow size={15} />
            </Link>
          </section>
        </aside>
      </div>

      <section className={styles.actionSection}>
        <header className={styles.sectionHeader}>
          <div>
            <span className={styles.overline}>{t('dashboard.cta_eyebrow')}</span>
            <h2>{t('workspace.workspace_tools')}</h2>
          </div>
          <span>{t('workspace.tools_description')}</span>
        </header>
        <div className={styles.actionGrid}>
          {actions.map((action) => (
            <Link to={action.to} key={action.to} className={styles.actionCard}>
              <span className={styles.actionIcon}>{action.icon}</span>
              <div>
                <strong>{action.title}</strong>
                <span>{action.description}</span>
              </div>
              <Arrow size={16} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
