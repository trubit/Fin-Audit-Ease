import React from 'react'
import { User, ShieldCheck, Mail, Building, Award, Calendar, Clock, Briefcase } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { Badge } from '@/components/common/Badge/Badge'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { formatUserRole } from '@/features/auth/utils/roleUtils'
import { formatDate } from '@/utils/dateUtils'
import './ProfilePage.css'

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()

  const isAuditor =
    user?.role === 'AUDITOR' || user?.role === 'AUDIT_MANAGER' || user?.role === 'ADMIN'

  const profileTitle = isAuditor ? t('profile.auditorTitle') : t('profile.accountingTitle')
  const profileSubtitle = isAuditor ? t('profile.auditorSubtitle') : t('profile.accountingSubtitle')

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
    : ''

  return (
    <PageContainer
      title={profileTitle}
      subtitle={profileSubtitle}
      maxWidth="md"
    >
      <Breadcrumbs
        items={[
          { label: t('navigation.dashboard'), to: '/dashboard' },
          { label: profileTitle },
        ]}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {/* Profile Identity Card */}
        <div className="profile-card">
          <div className="profile-header-strip">
            <div className="profile-avatar-initials" aria-label="User avatar">
              {initials ? initials : <User size={28} />}
            </div>

            <div className="profile-identity-info">
              <div className="profile-name-row">
                <h2 className="profile-full-name">
                  {user?.fullName || t('profile.notSet')}
                </h2>
                <Badge variant="success">
                  <ShieldCheck size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {isAuditor ? t('profile.verifiedAuditorStatus') : t('profile.verifiedAccountingStatus')}
                </Badge>
              </div>
              <p className="profile-role-subtext">
                {formatUserRole(user?.role, t)}
              </p>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="profile-details-grid">
            {/* Corporate Email */}
            <div className="profile-detail-cell">
              <div className="profile-detail-icon" aria-hidden="true">
                <Mail size={18} />
              </div>
              <div>
                <p className="profile-detail-label">
                  {t('profile.email')}
                </p>
                <p className="profile-detail-val">
                  {user?.email || t('profile.notSet')}
                </p>
              </div>
            </div>

            {/* Organization / Firm (Role-Aware) */}
            <div className="profile-detail-cell">
              <div className="profile-detail-icon" aria-hidden="true">
                <Building size={18} />
              </div>
              <div>
                <p className="profile-detail-label">
                  {isAuditor ? t('profile.auditorOrganization') : t('profile.accountingOrganization')}
                </p>
                <p className="profile-detail-val">
                  {user?.organizationName || t('profile.notSet')}
                </p>
              </div>
            </div>

            {/* Job Title (Primary for Accounting Team, contextual for Auditor) */}
            {(!isAuditor || user?.jobTitle) && (
              <div className="profile-detail-cell">
                <div className="profile-detail-icon" aria-hidden="true">
                  <Briefcase size={18} />
                </div>
                <div>
                  <p className="profile-detail-label">
                    {t('profile.jobTitle')}
                  </p>
                  <p className="profile-detail-val">
                    {user?.jobTitle || t('profile.notSet')}
                  </p>
                </div>
              </div>
            )}

            {/* Accounting Year-End Date (Accounting Team Only - Fiscal Close Configuration) */}
            {!isAuditor && (
              <div className="profile-detail-cell">
                <div className="profile-detail-icon" aria-hidden="true">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="profile-detail-label">
                    {t('profile.accountingYearEndDate')}
                  </p>
                  <p className="profile-detail-val">
                    {user?.accountingYearEndDate
                      ? formatDate(user.accountingYearEndDate)
                      : t('profile.notSet')}
                  </p>
                </div>
              </div>
            )}

            {/* Commencement Date (Accounting Team if specified) */}
            {user?.commencementDate && (
              <div className="profile-detail-cell">
                <div className="profile-detail-icon" aria-hidden="true">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="profile-detail-label">
                    {t('profile.commencementDate', 'Commencement Date')}
                  </p>
                  <p className="profile-detail-val">
                    {formatDate(user.commencementDate)}
                  </p>
                </div>
              </div>
            )}

            {/* Professional Membership Number (Auditors always; Accounting Team if specified) */}
            {(isAuditor || user?.membershipNumber) && (
              <div className="profile-detail-cell">
                <div className="profile-detail-icon" aria-hidden="true">
                  <Award size={18} />
                </div>
                <div>
                  <p className="profile-detail-label">
                    {isAuditor
                      ? t('profile.membershipNumber')
                      : t('profile.membershipNumberOptional')}
                  </p>
                  <p className="profile-detail-val">
                    {user?.membershipNumber || t('profile.notSet')}
                  </p>
                </div>
              </div>
            )}

            {/* System Role */}
            <div className="profile-detail-cell">
              <div className="profile-detail-icon" aria-hidden="true">
                <Clock size={18} />
              </div>
              <div>
                <p className="profile-detail-label">
                  {t('profile.role')}
                </p>
                <p className="profile-detail-val">
                  {formatUserRole(user?.role, t)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Read-Only Information Notice (No fake editable fields on workstation) */}
        <div className="profile-security-notice">
          <ShieldCheck size={20} className="profile-security-icon" aria-hidden="true" />
          <p className="profile-security-text">
            {t('profile.readOnlyNotice')}
          </p>
        </div>
      </div>
    </PageContainer>
  )
}
