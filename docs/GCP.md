# WIF-Workload-Identity-Federation

`edu/devops/gclould/gcp-notes.md#gc-wif-workload-identity`

**Workload Identity Pool**:
A container for external identities (like *GitHub Actions*).

**Workload Identity Provider**:
Represents the external identity provider *GitHub* within the pool.
It configures how GCP trusts tokens issued by GitHub.

*TODO*: Connect the pool to GitHub.
This requires specifying *GitHub's OIDC* details and
mapping attributes (like `repository name`, `branch`, etc.).

**GCP Service Account**:
The identity within GCP that *GitHub Actions* will impersonate
to access resources (like *Artifact Registry*).

Allow the *WIF* provider (representing specific *GitHub* `repos/branches`)
to act as the *Service Account*. **This is the core IAM step.**

**IAM Policy Binding**:
Granting the external identity (represented by the pool/provider) permission
to impersonate the Service Account.

**GitHub Actions Workflow**:
Needs specific configuration (permissions: `id-token: write`) and
the `google-github-actions/auth` *action*.
