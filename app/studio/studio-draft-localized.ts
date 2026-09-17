import type { ViaLanguage } from "../via-local-settings"

type StudioDraftCopy = {
  creatorDraft: string
  prepareNextPost: string
  readOnly: string
  storedDevice: string
  seedWarning: string
  title: string
  titlePlaceholder: string
  postTools: string
  addSmile: string
  addHeart: string
  addFire: string
  poll: string
  postText: string
  postPlaceholder: string
  pollDraft: string
  pollOptions: string
  pollHelp: string
  option: string
  removeOption: string
  addOption: string
  postLanguage: string
  preferredFeed: string
  saveDraft: string
  clear: string
  continuePost: string
  charactersLeft: string
  draftTarget: string
  pollPrepared: string
  localFooter: string
  loginRequired: string
  usingDefaults: string
  restoredFrom: string
  unavailable: string
  saved: string
  saveFailed: string
  clearedDefaults: string
  clearStorageFailed: string
}

const copy: Record<ViaLanguage, StudioDraftCopy> = {
  Dutch: {
    creatorDraft: "Creator-concept",
    prepareNextPost: "Bereid je volgende post voor",
    readOnly: "De publieke ingang is alleen-lezen. Log in met DeSo om lokale VIA-concepten te maken, op te slaan of te openen.",
    storedDevice: "Alleen op dit apparaat opgeslagen",
    seedWarning: "Voer hier nooit je 24-woorden DeSo seed phrase, privésleutel of signing secret in.",
    title: "Titel",
    titlePlaceholder: "Geef je concept een werktitel",
    postTools: "Postgereedschap",
    addSmile: "Smiley toevoegen",
    addHeart: "Hart toevoegen",
    addFire: "Vuur toevoegen",
    poll: "Poll",
    postText: "Posttekst",
    postPlaceholder: "Schrijf je post, NFT-beschrijving of creator-notities... Plak een YouTube-link om die direct in VIA te bekijken.",
    pollDraft: "Poll-concept",
    pollOptions: "Poll-opties",
    pollHelp: "Bereid poll-opties hier lokaal voor. Publiceren gaat via de vrijgegeven VIA Feed-flow met expliciete DeSo Identity-goedkeuring.",
    option: "Optie",
    removeOption: "Poll-optie verwijderen",
    addOption: "Optie toevoegen",
    postLanguage: "Posttaal",
    preferredFeed: "Voorkeursfeed",
    saveDraft: "Concept opslaan",
    clear: "Wissen",
    continuePost: "Verder naar DeSo-post",
    charactersLeft: "tekens over",
    draftTarget: "Doel concept",
    pollPrepared: "Poll voorbereid",
    localFooter: "Conceptinstellingen blijven lokaal op dit apparaat. Publiceren van DeSo-posts en polls gebeurt via VIA Feed met expliciete DeSo Identity-goedkeuring.",
    loginRequired: "DeSo-login is nodig om lokale concepten te maken of te openen.",
    usingDefaults: "Instellingen gebruikt",
    restoredFrom: "Concept hersteld van",
    unavailable: "Lokale Studio-concepten zijn niet beschikbaar in deze browser.",
    saved: "Concept lokaal opgeslagen op dit apparaat.",
    saveFailed: "Concept kon niet in deze browser worden opgeslagen.",
    clearedDefaults: "Lokaal Studio-concept gewist. Standaardinstellingen hersteld",
    clearStorageFailed: "Concept uit de editor gewist, maar lokale browseropslag is niet beschikbaar.",
  },
  English: {
    creatorDraft: "Creator draft",
    prepareNextPost: "Prepare your next post",
    readOnly: "Public Entrance is read-only. Log in with DeSo to prepare, save or open local VIA drafts.",
    storedDevice: "Stored only on this device",
    seedWarning: "Never enter your 24-word DeSo seed phrase, private key or signing secret here.",
    title: "Title",
    titlePlaceholder: "Give your draft a working title",
    postTools: "Post tools",
    addSmile: "Add smile emoji",
    addHeart: "Add heart emoji",
    addFire: "Add fire emoji",
    poll: "Poll",
    postText: "Post text",
    postPlaceholder: "Write your post, NFT description or creator notes... Paste a YouTube link to preview it directly in VIA.",
    pollDraft: "Poll draft",
    pollOptions: "Poll options",
    pollHelp: "Prepare poll options locally here. Publishing happens through the released VIA Feed poll flow with explicit DeSo Identity approval.",
    option: "Option",
    removeOption: "Remove poll option",
    addOption: "Add option",
    postLanguage: "Post language",
    preferredFeed: "Preferred feed",
    saveDraft: "Save draft",
    clear: "Clear",
    continuePost: "Continue to DeSo post",
    charactersLeft: "characters left",
    draftTarget: "Draft target",
    pollPrepared: "Poll prepared",
    localFooter: "Draft settings stay local on this device. Released DeSo posting and poll publishing are handled by VIA Feed with explicit DeSo Identity approval.",
    loginRequired: "DeSo login is required to prepare or open local drafts.",
    usingDefaults: "Using Settings defaults",
    restoredFrom: "Draft restored from",
    unavailable: "Local Studio drafts are unavailable in this browser.",
    saved: "Draft saved locally on this device.",
    saveFailed: "Draft could not be saved in this browser.",
    clearedDefaults: "Local Studio draft cleared. Settings defaults restored",
    clearStorageFailed: "Draft cleared from the editor, but local browser storage is unavailable.",
  },
  French: {
    creatorDraft: "Brouillon créateur",
    prepareNextPost: "Préparez votre prochaine publication",
    readOnly: "L’entrée publique est en lecture seule. Connectez-vous avec DeSo pour préparer, enregistrer ou ouvrir des brouillons VIA locaux.",
    storedDevice: "Stocké uniquement sur cet appareil",
    seedWarning: "Ne saisissez jamais ici votre phrase seed DeSo de 24 mots, votre clé privée ou un secret de signature.",
    title: "Titre",
    titlePlaceholder: "Donnez un titre de travail au brouillon",
    postTools: "Outils de publication",
    addSmile: "Ajouter un sourire",
    addHeart: "Ajouter un cœur",
    addFire: "Ajouter une flamme",
    poll: "Sondage",
    postText: "Texte de la publication",
    postPlaceholder: "Rédigez votre publication, description NFT ou notes créateur... Collez un lien YouTube pour l’aperçu dans VIA.",
    pollDraft: "Brouillon de sondage",
    pollOptions: "Options du sondage",
    pollHelp: "Préparez ici les options localement. La publication passe par le flux de sondage VIA Feed avec approbation explicite DeSo Identity.",
    option: "Option",
    removeOption: "Supprimer l’option",
    addOption: "Ajouter une option",
    postLanguage: "Langue de publication",
    preferredFeed: "Fil préféré",
    saveDraft: "Enregistrer le brouillon",
    clear: "Effacer",
    continuePost: "Continuer vers la publication DeSo",
    charactersLeft: "caractères restants",
    draftTarget: "Cible du brouillon",
    pollPrepared: "Sondage préparé",
    localFooter: "Les réglages du brouillon restent locaux sur cet appareil. Les publications et sondages DeSo passent par VIA Feed avec approbation explicite DeSo Identity.",
    loginRequired: "Une connexion DeSo est requise pour préparer ou ouvrir des brouillons locaux.",
    usingDefaults: "Paramètres par défaut utilisés",
    restoredFrom: "Brouillon restauré depuis",
    unavailable: "Les brouillons Studio locaux ne sont pas disponibles dans ce navigateur.",
    saved: "Brouillon enregistré localement sur cet appareil.",
    saveFailed: "Le brouillon n’a pas pu être enregistré dans ce navigateur.",
    clearedDefaults: "Brouillon Studio local effacé. Paramètres par défaut restaurés",
    clearStorageFailed: "Brouillon effacé de l’éditeur, mais le stockage local du navigateur est indisponible.",
  },
  Spanish: {
    creatorDraft: "Borrador de creador",
    prepareNextPost: "Prepara tu próxima publicación",
    readOnly: "La entrada pública es de solo lectura. Inicia sesión con DeSo para preparar, guardar o abrir borradores locales de VIA.",
    storedDevice: "Guardado solo en este dispositivo",
    seedWarning: "Nunca introduzcas aquí tu frase seed DeSo de 24 palabras, clave privada o secreto de firma.",
    title: "Título",
    titlePlaceholder: "Pon un título de trabajo al borrador",
    postTools: "Herramientas de publicación",
    addSmile: "Añadir sonrisa",
    addHeart: "Añadir corazón",
    addFire: "Añadir fuego",
    poll: "Encuesta",
    postText: "Texto de la publicación",
    postPlaceholder: "Escribe tu publicación, descripción NFT o notas de creador... Pega un enlace de YouTube para previsualizarlo en VIA.",
    pollDraft: "Borrador de encuesta",
    pollOptions: "Opciones de encuesta",
    pollHelp: "Prepara aquí las opciones localmente. La publicación se realiza mediante el flujo de encuestas de VIA Feed con aprobación explícita de DeSo Identity.",
    option: "Opción",
    removeOption: "Eliminar opción",
    addOption: "Añadir opción",
    postLanguage: "Idioma de publicación",
    preferredFeed: "Feed preferido",
    saveDraft: "Guardar borrador",
    clear: "Borrar",
    continuePost: "Continuar a la publicación DeSo",
    charactersLeft: "caracteres restantes",
    draftTarget: "Destino del borrador",
    pollPrepared: "Encuesta preparada",
    localFooter: "La configuración del borrador permanece local en este dispositivo. Las publicaciones y encuestas DeSo se gestionan mediante VIA Feed con aprobación explícita de DeSo Identity.",
    loginRequired: "Se requiere inicio de sesión DeSo para preparar o abrir borradores locales.",
    usingDefaults: "Usando valores predeterminados",
    restoredFrom: "Borrador restaurado desde",
    unavailable: "Los borradores locales de Studio no están disponibles en este navegador.",
    saved: "Borrador guardado localmente en este dispositivo.",
    saveFailed: "El borrador no pudo guardarse en este navegador.",
    clearedDefaults: "Borrador local de Studio borrado. Valores predeterminados restaurados",
    clearStorageFailed: "Borrador borrado del editor, pero el almacenamiento local del navegador no está disponible.",
  },
  Chinese: {
    creatorDraft: "创作者草稿",
    prepareNextPost: "准备下一篇帖子",
    readOnly: "公共入口为只读。请使用 DeSo 登录后准备、保存或打开本地 VIA 草稿。",
    storedDevice: "仅保存在此设备",
    seedWarning: "切勿在此输入 24 个单词的 DeSo 助记词、私钥或签名密钥。",
    title: "标题",
    titlePlaceholder: "为草稿输入工作标题",
    postTools: "帖子工具",
    addSmile: "添加笑脸",
    addHeart: "添加爱心",
    addFire: "添加火焰",
    poll: "投票",
    postText: "帖子文字",
    postPlaceholder: "撰写帖子、NFT 描述或创作者笔记……粘贴 YouTube 链接可直接在 VIA 中预览。",
    pollDraft: "投票草稿",
    pollOptions: "投票选项",
    pollHelp: "在此本地准备投票选项。发布将通过 VIA Feed 投票流程并需要明确的 DeSo Identity 批准。",
    option: "选项",
    removeOption: "删除投票选项",
    addOption: "添加选项",
    postLanguage: "帖子语言",
    preferredFeed: "首选 Feed",
    saveDraft: "保存草稿",
    clear: "清除",
    continuePost: "继续到 DeSo 帖子",
    charactersLeft: "个字符剩余",
    draftTarget: "草稿目标",
    pollPrepared: "投票已准备",
    localFooter: "草稿设置仅保存在此设备。本地 DeSo 帖子和投票发布通过 VIA Feed，并需要明确的 DeSo Identity 批准。",
    loginRequired: "需要 DeSo 登录才能准备或打开本地草稿。",
    usingDefaults: "正在使用默认设置",
    restoredFrom: "草稿已恢复，来源",
    unavailable: "此浏览器无法使用本地 Studio 草稿。",
    saved: "草稿已保存在此设备。",
    saveFailed: "无法在此浏览器中保存草稿。",
    clearedDefaults: "本地 Studio 草稿已清除，默认设置已恢复",
    clearStorageFailed: "草稿已从编辑器清除，但浏览器本地存储不可用。",
  },
}

export function studioDraftCopy(language: ViaLanguage) {
  return copy[language] ?? copy.English
}
