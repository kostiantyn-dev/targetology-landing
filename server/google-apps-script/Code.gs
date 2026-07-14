const OWNER_USERNAME = "SilkaAlina";
const BOT_USERNAME = "AlinaSilkaLeadsBot";

function doGet() {
  return jsonResponse_({
    ok: true,
    service: "Alina Silka lead handler",
  });
}

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData?.contents || "{}");

    if (payload.update_id) {
      const expectedHook = getProperties_().getProperty("WEBHOOK_KEY");
      if (!expectedHook || event.parameter?.hook !== expectedHook) {
        throw new Error("Invalid webhook");
      }

      handleTelegramUpdate_(payload);
    } else {
      handleLead_(payload);
    }

    return jsonResponse_({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonResponse_({ ok: false, error: String(error.message || error) });
  }
}

function handleLead_(lead) {
  const fields = ["name", "niche", "project_url"];
  fields.forEach((field) => {
    if (!String(lead[field] || "").trim()) {
      throw new Error(`Missing field: ${field}`);
    }
  });

  if (lead.website) {
    throw new Error("Spam rejected");
  }

  const cache = CacheService.getScriptCache();
  const rateKey = `lead:${String(lead.project_url || lead.name).toLowerCase().slice(0, 80)}`;
  if (cache.get(rateKey)) {
    throw new Error("Please wait before submitting again");
  }
  cache.put(rateKey, "1", 60);

  const ownerChatId = getProperties_().getProperty("OWNER_CHAT_ID");
  if (!ownerChatId) {
    throw new Error("Owner is not connected");
  }

  const text = [
    "🆕 Нова заявка із сайту",
    "",
    `👤 Ім'я: ${clean_(lead.name)}`,
    `🧭 Ніша: ${clean_(lead.niche)}`,
    `🔗 Instagram: ${clean_(lead.project_url)}`,
  ].join("\n");

  sendTelegram_(ownerChatId, text);
}

function handleTelegramUpdate_(update) {
  const message = update.message;
  if (!message?.chat?.id) return;

  const chatId = String(message.chat.id);
  const username = String(message.from?.username || "").toLowerCase();
  const text = String(message.text || "");

  if (username === OWNER_USERNAME.toLowerCase()) {
    getProperties_().setProperty("OWNER_CHAT_ID", chatId);

    if (text.startsWith("/start")) {
      sendTelegram_(
        chatId,
        "✅ Ви підключені як власник. Нові заявки із сайту надходитимуть у цей чат."
      );
      return;
    }
  }

  if (text.startsWith("/start")) {
    sendTelegram_(
      chatId,
      [
        "✅ Дякуємо! Вашу заявку отримано.",
        "",
        "Аліна перегляне інформацію та зв’яжеться з вами в Telegram найближчим часом.",
      ].join("\n")
    );
  }
}

function setupWebhook() {
  const properties = getProperties_();
  const token = properties.getProperty("BOT_TOKEN");
  if (!token) throw new Error("Add BOT_TOKEN to Script Properties first");

  const webAppUrl = ScriptApp.getService().getUrl();
  if (!webAppUrl) throw new Error("Deploy the script as a web app first");

  let hookKey = properties.getProperty("WEBHOOK_KEY");
  if (!hookKey) {
    hookKey = Utilities.getUuid().replace(/-/g, "");
    properties.setProperty("WEBHOOK_KEY", hookKey);
  }

  const response = UrlFetchApp.fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        url: `${webAppUrl}?hook=${hookKey}`,
        allowed_updates: ["message"],
        drop_pending_updates: true,
      }),
      muteHttpExceptions: true,
    }
  );

  const result = JSON.parse(response.getContentText());
  if (!result.ok) throw new Error(result.description || "Webhook setup failed");
  return result;
}

function sendTelegram_(chatId, text) {
  const token = getProperties_().getProperty("BOT_TOKEN");
  if (!token) throw new Error("BOT_TOKEN is missing");

  const response = UrlFetchApp.fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
      muteHttpExceptions: true,
    }
  );

  const result = JSON.parse(response.getContentText());
  if (!result.ok) throw new Error(result.description || "Telegram send failed");
  return result;
}

function getProperties_() {
  return PropertiesService.getScriptProperties();
}

function clean_(value) {
  return String(value || "").trim().slice(0, 500);
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
