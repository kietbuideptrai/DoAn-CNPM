import type {
  ArtifactDetail,
  ArtifactListItem,
  Language,
  Translation,
} from "./types";

interface DemoArtifact {
  slug: string;
  image_url: string;
  translations: Record<Language, Translation>;
}

const placeholderImage = "/images/artifacts/museum-placeholder.svg";

export const demoArtifacts: DemoArtifact[] = [
  {
    slug: "a-1-skyraider",
    image_url: placeholderImage,
    translations: {
      en: {
        language_code: "en",
        title: "A-1 Skyraider attack aircraft",
        summary: "A US-made propeller-driven attack aircraft used for ground support.",
        content: "The A-1 Skyraider is a propeller-driven attack aircraft made in the United States.\r\nIt was used to strike ground targets and to support infantry forces.\r\nThis exhibit shows the variety of aircraft used during the Vietnam War.",
      },
      ja: {
        language_code: "ja",
        title: "A-1スカイレイダー攻撃機",
        summary: "地上支援に使用された米国製のプロペラ攻撃機です。",
        content: "A-1スカイレイダーは米国製のプロペラ駆動攻撃機です。\r\n地上目標への攻撃や歩兵部隊への支援に使用されました。\r\nこの展示品は、ベトナム戦争で使用された航空機の多様性を示しています。",
      },
      ko: {
        language_code: "ko",
        title: "A-1 스카이레이더 공격기",
        summary: "지상 지원 임무에 사용된 미국산 프로펠러 공격기입니다.",
        content: "A-1 스카이레이더는 미국에서 제작한 프로펠러 추진 공격기입니다.\r\n지상 목표물을 공격하고 보병 부대를 지원하는 데 사용되었습니다.\r\n이 전시물은 베트남 전쟁에서 사용된 항공기의 다양성을 보여 줍니다.",
      },
      vi: {
        language_code: "vi",
        title: "Máy bay cường kích A-1 Skyraider",
        summary: "Máy bay cường kích cánh quạt do Mỹ sản xuất, dùng để yểm trợ mặt đất.",
        content: "A-1 Skyraider là máy bay cường kích động cơ cánh quạt do Mỹ sản xuất.\r\nLoại máy bay này được dùng để tấn công mục tiêu mặt đất và yểm trợ cho lực lượng bộ binh.\r\nHiện vật cho thấy sự đa dạng của các loại máy bay được sử dụng trong chiến tranh Việt Nam.",
      },
      zh: {
        language_code: "zh",
        title: "A-1“天袭者”攻击机",
        summary: "美国制造的螺旋桨攻击机，曾用于地面支援。",
        content: "A-1“天袭者”是美国制造的螺旋桨攻击机。\r\n它被用于攻击地面目标，并为步兵部队提供支援。\r\n这件展品展示了越南战争期间所使用飞机的多样性。",
      },
    },
  },
  {
    slug: "blu-82",
    image_url: placeholderImage,
    translations: {
      en: {
        language_code: "en",
        title: "BLU-82 bomb (7-ton bomb)",
        summary: "A very large bomb weighing about 7 tonnes, made in the United States.",
        content: "The BLU-82 is a very large bomb made in the United States, weighing about 7 tonnes, which is why it is also called the 7-ton bomb.\r\nIt was dropped from a transport aircraft and was often used to clear landing zones for helicopters in forested areas.\r\nThis exhibit shows the scale of the weapons used in the war.",
      },
      ja: {
        language_code: "ja",
        title: "BLU-82爆弾（約7トン）",
        summary: "米国製の大型爆弾で、重量は約7トンです。",
        content: "BLU-82は米国製の大型爆弾で、重量が約7トンあることから「7トン爆弾」とも呼ばれます。\r\n輸送機から投下され、森林地帯でヘリコプターの着陸地点を確保するために使用されることがありました。\r\nこの展示品は、戦争で使用された兵器の規模を紹介しています。",
      },
      ko: {
        language_code: "ko",
        title: "BLU-82 폭탄(약 7톤)",
        summary: "미국에서 제작한 대형 폭탄으로 무게는 약 7톤입니다.",
        content: "BLU-82는 미국에서 제작한 대형 폭탄으로, 무게가 약 7톤이어서 ‘7톤 폭탄’이라고도 불립니다.\r\n수송기에서 투하되었으며 숲 지역에 헬리콥터 착륙 지점을 확보하는 데 사용되기도 했습니다.\r\n이 전시물은 전쟁 중 사용된 무기의 규모를 소개합니다.",
      },
      vi: {
        language_code: "vi",
        title: "Bom BLU-82 (bom 7 tấn)",
        summary: "Loại bom cỡ lớn nặng khoảng 7 tấn do Mỹ chế tạo.",
        content: "BLU-82 là loại bom cỡ lớn do Mỹ chế tạo, có khối lượng khoảng 7 tấn nên còn được gọi là bom 7 tấn.\r\nBom được thả từ máy bay vận tải và thường được dùng để tạo bãi đáp trực thăng trong rừng.\r\nHiện vật được trưng bày để giới thiệu quy mô của các loại vũ khí được sử dụng trong chiến tranh.",
      },
      zh: {
        language_code: "zh",
        title: "BLU-82炸弹（约7吨）",
        summary: "美国制造的大型炸弹，重量约为7吨。",
        content: "BLU-82是美国制造的大型炸弹，重量约为7吨，因此也被称为“七吨炸弹”。\r\n它由运输机投放，曾用于在森林地区开辟直升机着陆场。\r\n这件展品展示了战争期间使用的武器规模。",
      },
    },
  },
  {
    slug: "chuong-cop-con-dao",
    image_url: placeholderImage,
    translations: {
      en: {
        language_code: "en",
        title: "Model of the Con Dao tiger cages",
        summary: "A model recreating the harsh confinement of political prisoners at Con Dao prison.",
        content: "The tiger cages were a form of confining political prisoners in harsh conditions at Con Dao prison.\r\nThe museum displays a model that recreates this space for visitors.\r\nThe model stands as a testimony to the sacrifices of political prisoners in history.",
      },
      ja: {
        language_code: "ja",
        title: "コンダオ刑務所の「トラの檻」の模型",
        summary: "コンダオ刑務所で政治犯が過酷な環境に置かれた収容施設を再現した模型です。",
        content: "「トラの檻」は、コンダオ刑務所で政治犯を過酷な環境に拘禁した施設です。\r\n博物館では、当時の収容空間を来館者に伝えるために模型を展示しています。\r\nこの模型は、歴史の中で政治犯が払った犠牲を伝えています。",
      },
      ko: {
        language_code: "ko",
        title: "꼰다오 감옥의 ‘호랑이 우리’ 모형",
        summary: "꼰다오 감옥에서 정치범을 가혹한 환경에 가두었던 시설을 재현한 모형입니다.",
        content: "‘호랑이 우리’는 꼰다오 감옥에서 정치범을 열악하고 가혹한 환경에 구금하던 시설입니다.\r\n박물관은 당시의 수감 공간을 방문객에게 보여 주기 위해 모형을 전시하고 있습니다.\r\n이 모형은 역사 속 정치범들이 겪은 희생을 보여 주는 증거입니다.",
      },
      vi: {
        language_code: "vi",
        title: "Mô hình chuồng cọp Côn Đảo",
        summary: "Mô hình tái hiện nơi giam giữ tù chính trị khắc nghiệt tại nhà tù Côn Đảo.",
        content: "Chuồng cọp là hình thức giam giữ tù chính trị trong điều kiện khắc nghiệt tại nhà tù Côn Đảo.\r\nBảo tàng trưng bày mô hình để tái hiện lại không gian giam cầm này cho người xem.\r\nMô hình là chứng tích về những hy sinh của các tù nhân chính trị trong lịch sử.",
      },
      zh: {
        language_code: "zh",
        title: "昆岛监狱“虎笼”模型",
        summary: "再现昆岛监狱严酷关押政治犯环境的模型。",
        content: "“虎笼”是昆岛监狱中用于在恶劣条件下关押政治犯的设施。\r\n博物馆通过展示模型，让参观者了解当时的囚禁空间。\r\n这件模型见证了政治犯在历史中所承受的苦难与牺牲。",
      },
    },
  },
  {
    slug: "f-5a",
    image_url: placeholderImage,
    translations: {
      en: {
        language_code: "en",
        title: "F-5A fighter aircraft",
        summary: "A lightweight supersonic jet fighter made in the United States.",
        content: "The F-5A is a lightweight supersonic jet fighter built by the American company Northrop.\r\nIt was supplied to several air forces allied with the United States, including the air force of the Saigon government.\r\nThis exhibit shows visitors the scale of the air power used during the war.",
      },
      ja: {
        language_code: "ja",
        title: "F-5A戦闘機",
        summary: "米国で製造された軽量の超音速ジェット戦闘機です。",
        content: "F-5Aは、米国のノースロップ社が開発した軽量の超音速ジェット戦闘機です。\r\n米国の同盟国の複数の空軍に供与され、その中にはサイゴン政権の空軍も含まれていました。\r\nこの展示品は、戦争で使用された航空戦力の規模を来館者に伝えています。",
      },
      ko: {
        language_code: "ko",
        title: "F-5A 전투기",
        summary: "미국에서 제작한 경량 초음속 제트 전투기입니다.",
        content: "F-5A는 미국 노스럽사가 제작한 경량 초음속 제트 전투기입니다.\r\n미국의 여러 동맹국 공군에 공급되었으며, 그중에는 사이공 정권의 공군도 포함되었습니다.\r\n이 전시물은 전쟁 중 사용된 공군 전력의 규모를 보여 줍니다.",
      },
      vi: {
        language_code: "vi",
        title: "Máy bay chiến đấu F-5A",
        summary: "Máy bay chiến đấu phản lực siêu âm hạng nhẹ do Mỹ sản xuất.",
        content: "F-5A là máy bay chiến đấu phản lực siêu âm hạng nhẹ do hãng Northrop của Mỹ chế tạo.\r\nLoại máy bay này được cung cấp cho một số lực lượng không quân đồng minh của Mỹ, trong đó có không quân của chính quyền Sài Gòn.\r\nHiện vật cho du khách thấy quy mô của các phương tiện không quân được sử dụng trong cuộc chiến.",
      },
      zh: {
        language_code: "zh",
        title: "F-5A战斗机",
        summary: "美国制造的轻型超音速喷气式战斗机。",
        content: "F-5A是美国诺斯罗普公司制造的轻型超音速喷气式战斗机。\r\n它曾提供给多个与美国结盟的空军，其中包括西贡政权的空军。\r\n这件展品让参观者了解战争期间所使用的空中作战力量规模。",
      },
    },
  },
  {
    slug: "m48-patton",
    image_url: placeholderImage,
    translations: {
      en: {
        language_code: "en",
        title: "M48 Patton tank",
        summary: "A US-made main battle tank used during the Vietnam War.",
        content: "The M48 Patton is a main battle tank made in the United States, armed with a 90 mm main gun.\r\nIt was used in the Vietnam War by US forces and by the army of the Saigon government.\r\nThis exhibit stands in the outdoor area and helps visitors picture the armored power deployed in the war.",
      },
      ja: {
        language_code: "ja",
        title: "M48パットン戦車",
        summary: "ベトナム戦争で使用された米国製の主力戦車です。",
        content: "M48パットンは米国製の主力戦車で、主砲には口径90 mmの砲を備えています。\r\nベトナム戦争では米軍およびサイゴン政権の軍隊によって使用されました。\r\n屋外展示エリアにあるこの展示品は、戦争で投入された装甲戦力を理解する手がかりとなります。",
      },
      ko: {
        language_code: "ko",
        title: "M48 패튼 전차",
        summary: "베트남 전쟁에서 사용된 미국산 주력전차입니다.",
        content: "M48 패튼은 미국에서 제작한 주력전차로, 90mm 주포를 장착했습니다.\r\n베트남 전쟁 당시 미군과 사이공 정권의 군대가 이 전차를 사용했습니다.\r\n야외 전시장에 있는 이 전시물은 전쟁에 투입된 기갑 전력의 규모를 이해하는 데 도움을 줍니다.",
      },
      vi: {
        language_code: "vi",
        title: "Xe tăng M48 Patton",
        summary: "Xe tăng chủ lực do Mỹ sản xuất, được sử dụng trong chiến tranh Việt Nam.",
        content: "M48 Patton là dòng xe tăng chủ lực do Mỹ sản xuất, được trang bị pháo chính cỡ 90 mm.\r\nXe tăng này được sử dụng trong chiến tranh Việt Nam bởi quân đội Mỹ và quân đội Sài Gòn.\r\nHiện vật nằm trong khu vực trưng bày ngoài trời, giúp du khách hình dung sức mạnh thiết giáp trong cuộc chiến.",
      },
      zh: {
        language_code: "zh",
        title: "M48巴顿坦克",
        summary: "美国制造、曾在越南战争中使用的主战坦克。",
        content: "M48巴顿是美国制造的主战坦克，配备一门90毫米主炮。\r\n越南战争期间，美国军队和西贡政权军队都曾使用这种坦克。\r\n这件展品位于室外展区，帮助参观者了解战争中投入的装甲力量。",
      },
    },
  },
  {
    slug: "may-chem",
    image_url: placeholderImage,
    translations: {
      en: {
        language_code: "en",
        title: "Guillotine from the French colonial era and the Ngo Dinh Diem government",
        summary: "An execution device used during the French colonial period and under the Ngo Dinh Diem government.",
        content: "The guillotine is a device used for executions, and it was used in Vietnam during the French colonial period and under the government of Ngo Dinh Diem.\r\nAccording to the museum's presentation, many patriots and revolutionaries were executed with this device.\r\nThe exhibit is displayed as a historical testimony to political repression.",
      },
      ja: {
        language_code: "ja",
        title: "フランス植民地時代およびゴ・ディン・ジエム政権期のギロチン",
        summary: "フランス植民地時代とゴ・ディン・ジエム政権下で使用された処刑器具です。",
        content: "ギロチンは死刑執行に用いられる器具で、ベトナムではフランス植民地時代およびゴ・ディン・ジエム政権下で使用されました。\r\n博物館の展示解説によると、多くの愛国者や革命活動家がこの器具で処刑されました。\r\nこの展示品は、歴史上の政治的弾圧を伝える資料として展示されています。",
      },
      ko: {
        language_code: "ko",
        title: "프랑스 식민지 시기와 응오딘지엠 정권 시기의 단두대",
        summary: "프랑스 식민지 시기와 응오딘지엠 정권 아래에서 사용된 사형 집행 도구입니다.",
        content: "단두대는 사형 집행에 사용되는 도구로, 베트남에서는 프랑스 식민지 시기와 응오딘지엠 정권 아래에서 사용되었습니다.\r\n박물관의 전시 설명에 따르면 많은 애국자와 혁명 활동가가 이 도구로 처형되었습니다.\r\n이 전시물은 역사 속 정치적 탄압을 보여 주는 자료로 전시되어 있습니다.",
      },
      vi: {
        language_code: "vi",
        title: "Máy chém thời Pháp thuộc và chính quyền Ngô Đình Diệm",
        summary: "Dụng cụ thi hành án tử hình được sử dụng trong thời kỳ Pháp thuộc và dưới chính quyền Ngô Đình Diệm.",
        content: "Máy chém là dụng cụ dùng để thi hành án tử hình, được sử dụng ở Việt Nam trong thời kỳ Pháp thuộc và dưới chính quyền Ngô Đình Diệm.\r\nTheo thuyết minh của bảo tàng, nhiều người yêu nước và chiến sĩ cách mạng đã bị thi hành án bằng công cụ này.\r\nHiện vật được trưng bày như một chứng tích về sự đàn áp trong lịch sử.",
      },
      zh: {
        language_code: "zh",
        title: "法国殖民时期及吴廷琰政权时期使用的断头台",
        summary: "法国殖民时期和吴廷琰政权统治下使用的死刑执行工具。",
        content: "断头台是一种执行死刑的器具，在越南的法国殖民时期及吴廷琰政权时期曾被使用。\r\n根据博物馆的展览说明，许多爱国者和革命人士曾被这种器具处决。\r\n这件展品作为历史见证，呈现了当时的政治镇压。",
      },
    },
  },
  {
    slug: "phao-155mm",
    image_url: placeholderImage,
    translations: {
      en: {
        language_code: "en",
        title: "155 mm howitzer",
        summary: "A heavy 155 mm artillery piece made in the United States.",
        content: "The 155 mm howitzer is a heavy artillery piece made in the United States, firing explosive shells over long distances to support infantry.\r\nIt was widely used by US forces and by the army of the Saigon government during the Vietnam War.\r\nThis exhibit stands in the outdoor area and shows the firepower of artillery in the war.",
      },
      ja: {
        language_code: "ja",
        title: "155 mm榴弾砲",
        summary: "米国製の口径155 mmの重砲です。",
        content: "155 mm榴弾砲は米国製の重砲で、歩兵部隊を支援するために遠距離から爆発弾を発射します。\r\nベトナム戦争では米軍およびサイゴン政権の軍隊によって広く使用されました。\r\n屋外展示エリアにあるこの展示品は、戦争における砲兵火力を示しています。",
      },
      ko: {
        language_code: "ko",
        title: "155mm 곡사포",
        summary: "미국에서 제작한 155mm 구경의 중화기입니다.",
        content: "155mm 곡사포는 보병을 지원하기 위해 장거리로 고폭탄을 발사하는 미국산 중화기입니다.\r\n베트남 전쟁 당시 미군과 사이공 정권의 군대가 널리 사용했습니다.\r\n야외 전시장에 있는 이 전시물은 전쟁 당시 포병 화력의 규모를 보여 줍니다.",
      },
      vi: {
        language_code: "vi",
        title: "Pháo 155 mm",
        summary: "Pháo hạng nặng cỡ nòng 155 mm do Mỹ sản xuất.",
        content: "Pháo 155 mm là loại pháo hạng nặng do Mỹ sản xuất, bắn đạn nổ ở tầm xa để hỗ trợ lực lượng bộ binh.\r\nLoại pháo này được sử dụng rộng rãi bởi quân đội Mỹ và quân đội Sài Gòn trong chiến tranh Việt Nam.\r\nHiện vật nằm trong khu ngoài trời, cho thấy sức mạnh hỏa lực pháo binh trong cuộc chiến.",
      },
      zh: {
        language_code: "zh",
        title: "155毫米榴弹炮",
        summary: "美国制造的155毫米口径重型火炮。",
        content: "155毫米榴弹炮是美国制造的重型火炮，可向远距离目标发射爆炸弹药以支援步兵。\r\n越南战争期间，美国军队和西贡政权军队广泛使用这种火炮。\r\n这件室外展品展示了战争中的炮兵火力。",
      },
    },
  },
  {
    slug: "uh-1-huey",
    image_url: placeholderImage,
    translations: {
      en: {
        language_code: "en",
        title: "UH-1 Huey helicopter",
        summary: "A US multi-purpose helicopter widely used during the Vietnam War.",
        content: "The UH-1 Huey is a multi-purpose helicopter made in the United States and was a common sight in the Vietnam War.\r\nIt was used to carry troops, deliver supplies, evacuate the wounded and provide fire support.\r\nThis exhibit is displayed in the outdoor area of the War Remnants Museum to illustrate the mobile transport used by US forces during the war.",
      },
      ja: {
        language_code: "ja",
        title: "UH-1ヒューイ・ヘリコプター",
        summary: "ベトナム戦争で広く使用された米国製の多目的ヘリコプターです。",
        content: "UH-1ヒューイは米国で製造された多目的ヘリコプターで、ベトナム戦争中に広く使用されました。\r\n兵員輸送、物資補給、負傷者の搬送、火力支援などに用いられました。\r\nこの展示品は戦争中に米軍が使用した機動輸送手段を紹介するため、戦争証跡博物館の屋外展示エリアに置かれています。",
      },
      ko: {
        language_code: "ko",
        title: "UH-1 휴이 헬리콥터",
        summary: "베트남 전쟁에서 널리 사용된 미국산 다목적 헬리콥터입니다.",
        content: "UH-1 휴이는 미국에서 제작된 다목적 헬리콥터로, 베트남 전쟁 당시 널리 사용되었습니다.\r\n병력 수송, 보급품 운반, 부상자 후송 및 화력 지원에 활용되었습니다.\r\n이 전시물은 전쟁 당시 미군이 사용한 기동 수송 수단을 소개하기 위해 전쟁증적박물관 야외 전시장에 전시되어 있습니다.",
      },
      vi: {
        language_code: "vi",
        title: "Máy bay trực thăng UH-1 Huey",
        summary: "Trực thăng đa dụng của quân đội Mỹ, được sử dụng rộng rãi trong chiến tranh Việt Nam.",
        content: "UH-1 Huey là loại trực thăng đa dụng do Mỹ sản xuất, xuất hiện phổ biến trên chiến trường Việt Nam.\r\nLoại máy bay này được dùng để chở quân, tiếp tế, tải thương và yểm trợ hỏa lực.\r\nHiện vật được trưng bày tại khu ngoài trời của Bảo tàng Chứng tích Chiến tranh để giới thiệu phương tiện cơ động mà quân đội Mỹ sử dụng trong chiến tranh.",
      },
      zh: {
        language_code: "zh",
        title: "UH-1“休伊”直升机",
        summary: "美国制造的多用途直升机，曾在越南战争期间被广泛使用。",
        content: "UH-1“休伊”是美国制造的多用途直升机，在越南战争期间十分常见。\r\n它被用于运送士兵、补给物资、转运伤员以及提供火力支援。\r\n这件展品陈列在战争遗迹博物馆的室外展区，用于介绍美国军队在战争期间使用的机动运输装备。",
      },
    },
  },
];

export function getDemoArtifacts(
  language: Language,
  query = "",
): ArtifactListItem[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return demoArtifacts.flatMap((artifact) => {
    const translation = artifact.translations[language];
    if (!translation) {
      return [];
    }

    if (normalizedQuery && !matchesSearch(artifact, normalizedQuery)) {
      return [];
    }

    return [{
      slug: artifact.slug,
      image_url: artifact.image_url,
      title: translation.title,
      summary: translation.summary,
    }];
  });
}

/**
 * Search matches the original Vietnamese name and the English title, no matter
 * which language is currently used for display (PRD WEB-03 / AC-02).
 */
function matchesSearch(artifact: DemoArtifact, normalizedQuery: string): boolean {
  return [artifact.translations.vi.title, artifact.translations.en.title].some(
    (title) => title.toLocaleLowerCase().includes(normalizedQuery),
  );
}

export function getDemoArtifact(
  slug: string,
  language: Language,
): ArtifactDetail | null {
  const artifact = demoArtifacts.find((item) => item.slug === slug);
  if (!artifact) {
    return null;
  }

  return {
    slug: artifact.slug,
    image_url: artifact.image_url,
    translation: artifact.translations[language] ?? null,
    available_languages: Object.keys(artifact.translations) as Language[],
  };
}
