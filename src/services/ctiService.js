// Fetch is used instead of Axios to avoid global baseURL conflicts

const VIRUSTOTAL_API_KEY = import.meta.env.VITE_VIRUSTOTAL_API_KEY || "";
const ABUSEIPDB_API_KEY = import.meta.env.VITE_ABUSEIPDB_API_KEY || "";

export default {
  async checkVirusTotal(domain) {
    if (!VIRUSTOTAL_API_KEY) {
      throw new Error("VirusTotal API key is not configured.");
    }
    const response = await fetch(`/api/vt/domains/${domain}`, {
      headers: { "x-apikey": VIRUSTOTAL_API_KEY },
    });
    if (!response.ok) throw new Error(`VirusTotal request failed (HTTP ${response.status})`);
    return await response.json();
  },

  async resolveIp(domain) {
    try {
      const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`);
      if (!response.ok) return null;
      const data = await response.json();
      if (data.Answer && data.Answer.length > 0) {
        return data.Answer[0].data;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  async checkAbuseIPDB(ip) {
    if (!ABUSEIPDB_API_KEY) {
      throw new Error("AbuseIPDB API key is not configured.");
    }
    const response = await fetch(`/api/abuse/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90`, {
      headers: {
        Key: ABUSEIPDB_API_KEY,
        Accept: "application/json",
      },
    });
    if (!response.ok) throw new Error(`AbuseIPDB request failed (HTTP ${response.status})`);
    return await response.json();
  },

  async searchCrtSh(domain) {
    return this.getSslFromVirusTotal(domain);
  },

  async getSslFromVirusTotal(domain) {
    if (!VIRUSTOTAL_API_KEY) {
      throw new Error("VirusTotal API key is not configured.");
    }
    const response = await fetch(`/api/vt/domains/${domain}`, {
      headers: { "x-apikey": VIRUSTOTAL_API_KEY },
    });
    if (!response.ok) throw new Error(`VirusTotal SSL request failed (HTTP ${response.status})`);

    const data = await response.json();
    const cert = data?.data?.attributes?.last_https_certificate;
    if (!cert) {
      throw new Error("No SSL certificate data returned.");
    }
    return [
      {
        issuer_name: Object.entries(cert.issuer || {})
          .map(([k, v]) => `${k}=${v}`)
          .join(", "),
        name_value: cert.subject?.CN || domain,
        not_before: cert.validity?.not_before,
        not_after: cert.validity?.not_after,
      },
    ];
  },

  async getMyIp() {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      if (!response.ok) return null;
      const data = await response.json();
      return data.ip || null;
    } catch (error) {
      return null;
    }
  },

  async checkDns(domain, type = "A") {
    const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`);
    if (!response.ok) {
      throw new Error(`DNS lookup failed (HTTP ${response.status})`);
    }
    const data = await response.json();
    return Array.isArray(data.Answer) ? data.Answer : [];
  },
};
