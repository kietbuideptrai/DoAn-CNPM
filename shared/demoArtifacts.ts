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
    slug: "dong-hai-dong-1946",
    image_url: placeholderImage,
    translations: {
      vi: {
        language_code: "vi",
        title: "Đồng Hai đồng năm 1946",
        summary: "Đồng tiền kim loại mệnh giá cao nhất trong bộ tiền đầu tiên của Việt Nam Dân chủ Cộng hòa.",
        content:
          "Bộ tiền kim loại đầu tiên của Việt Nam Dân chủ Cộng hòa được phát hành từ năm 1945; đồng Hai đồng ra đời vào năm 1946. Bảo tàng Hồ Chí Minh hiện lưu giữ ba đồng tiền do ông Vũ Dương Biền gửi tặng năm 1980. Hiện vật kể câu chuyện về nỗ lực xây dựng nền tài chính của một quốc gia độc lập.",
      },
      en: {
        language_code: "en",
        title: "The 1946 Two-Dong Coin",
        summary: "The highest denomination in the first metal currency series of the Democratic Republic of Vietnam.",
        content:
          "The first metal currency of the Democratic Republic of Vietnam began circulating in 1945, and the two-dong coin followed in 1946. The Ho Chi Minh Museum preserves three coins donated by Vu Duong Bien in 1980. They recall the effort to establish a national financial system after independence.",
      },
      zh: {
        language_code: "zh",
        title: "1946年两盾硬币",
        summary: "越南民主共和国首套金属货币中面额最高的一种。",
        content:
          "越南民主共和国的首套金属货币自1945年开始发行，两盾硬币于1946年问世。胡志明博物馆保存着三枚硬币，由武阳边先生于1980年捐赠。它们记录了独立后建立国家金融体系的努力。",
      },
      ja: {
        language_code: "ja",
        title: "1946年発行の2ドン硬貨",
        summary: "ベトナム民主共和国で最初に発行された金属貨幣のうち、最高額面の硬貨です。",
        content:
          "ベトナム民主共和国の最初の金属貨幣は1945年から発行され、2ドン硬貨は1946年に登場しました。ホー・チ・ミン博物館は、1980年にヴー・ズオン・ビエン氏から寄贈された3枚を所蔵しています。独立後に国家の金融制度を築いた歩みを伝える資料です。",
      },
      ko: {
        language_code: "ko",
        title: "1946년 2동 동전",
        summary: "베트남민주공화국 최초 금속 화폐 가운데 액면가가 가장 높은 동전입니다.",
        content:
          "베트남민주공화국의 첫 금속 화폐는 1945년부터 발행되었고, 2동 동전은 1946년에 나왔습니다. 호찌민 박물관은 1980년 부즈엉비엔이 기증한 동전 세 점을 소장하고 있습니다. 독립 이후 국가 금융 제도를 세우려던 노력을 보여 주는 자료입니다.",
      },
    },
  },
  {
    slug: "me-con-ngay-gap-mat",
    image_url: placeholderImage,
    translations: {
      vi: {
        language_code: "vi",
        title: "Bức ảnh “Mẹ con ngày gặp mặt”",
        summary: "Khoảnh khắc đoàn tụ của người mẹ và người con sau ngày đất nước thống nhất.",
        content:
          "Nhiếp ảnh gia Lâm Hồng Long chụp bức ảnh tại cảng Rạch Dừa ngày 6/5/1975, khi chuyến tàu đầu tiên đưa 35 tù nhân Côn Đảo trở về đất liền. Bức ảnh ghi lại cuộc hội ngộ giữa bà Trần Thị Bính và con trai Lê Văn Thức sau nhiều năm xa cách. Tác phẩm hiện được giới thiệu tại Bảo tàng Hồ Chí Minh trong chủ đề Tổ quốc thống nhất.",
      },
      en: {
        language_code: "en",
        title: "“Mother and Son Reunited”",
        summary: "A mother and son meet again after the country's reunification.",
        content:
          "Photographer Lam Hong Long took this picture at Rach Dua Port on 6 May 1975, when the first boat brought 35 Con Dao prisoners back to the mainland. It captures Tran Thi Binh reuniting with her son Le Van Thuc after years apart. The photograph is presented at the Ho Chi Minh Museum as part of its reunification theme.",
      },
      zh: {
        language_code: "zh",
        title: "《母子重逢》照片",
        summary: "国家统一后，一对母子终于团聚的瞬间。",
        content:
          "摄影记者林鸿龙于1975年5月6日在石榴港拍下这张照片。当时，首艘船将35名昆岛囚犯送回大陆，照片记录了陈氏秉与儿子黎文识多年后重逢的时刻。胡志明博物馆在“祖国统一”主题展中展出这幅作品。",
      },
      ja: {
        language_code: "ja",
        title: "「母と子の再会」写真",
        summary: "南北統一後、母と息子が再会した瞬間を捉えた写真です。",
        content:
          "報道写真家ラム・ホン・ロンは1975年5月6日、コンダオ島の囚人35人を本土へ送り届けた最初の船が着いたラックズア港で撮影しました。長い別離の後、チャン・ティ・ビンさんと息子レ・バン・トゥックさんが再会する場面を記録しています。ホー・チ・ミン博物館の「祖国統一」展示で紹介されています。",
      },
      ko: {
        language_code: "ko",
        title: "‘어머니와 아들의 재회’ 사진",
        summary: "조국 통일 뒤 어머니와 아들이 다시 만나는 순간을 담았습니다.",
        content:
          "사진기자 럼홍롱은 1975년 5월 6일, 꼰다오 수감자 35명을 본토로 데려온 첫 배가 도착한 락즈어 항구에서 이 사진을 촬영했습니다. 오랜 이별 뒤 쩐티빈과 아들 레반특이 만나는 장면을 기록했습니다. 호찌민 박물관의 ‘조국 통일’ 주제 전시에서 소개됩니다.",
      },
    },
  },
  {
    slug: "tap-tho-trong-tuyen",
    image_url: placeholderImage,
    translations: {
      vi: {
        language_code: "vi",
        title: "Tập thơ Trọng Tuyển",
        summary: "Tập thơ viết tay được đoàn đại biểu miền Nam kính tặng Chủ tịch Hồ Chí Minh năm 1962.",
        content:
          "Tập thơ gồm 38 bài do chiến sĩ, nhà thơ Nguyễn Trọng Tuyển sáng tác trong thời gian bị giam tại nhà tù Gia Định. Năm 1962, đoàn đại biểu Mặt trận Dân tộc Giải phóng miền Nam mang tập thơ ra miền Bắc kính tặng Chủ tịch Hồ Chí Minh. Hiện vật lưu giữ tình cảm của đồng bào miền Nam và câu chuyện về người viết đã hy sinh năm 1959.",
      },
      en: {
        language_code: "en",
        title: "The Trọng Tuyển Poetry Collection",
        summary: "A handwritten collection presented to President Ho Chi Minh by a southern delegation in 1962.",
        content:
          "The collection contains 38 poems written by revolutionary soldier and poet Nguyen Trong Tuyen while imprisoned in Gia Dinh. In 1962, a delegation from the National Liberation Front of South Vietnam brought it north as a gift for President Ho Chi Minh. The artifact preserves a story of southern affection and a poet who died in 1959.",
      },
      zh: {
        language_code: "zh",
        title: "《重选诗集》",
        summary: "1962年，南方代表团将这本手抄诗集赠给胡志明主席。",
        content:
          "这本诗集收录了革命战士兼诗人阮仲选在嘉定监狱服刑期间创作的38首诗。1962年，南方解放民族阵线代表团将诗集带到北方，赠予胡志明主席。这件文物记录了南方同胞的深情，也讲述了1959年牺牲的诗人。",
      },
      ja: {
        language_code: "ja",
        title: "チョン・トゥエン詩集",
        summary: "1962年、南部代表団がホー・チ・ミン主席に贈った手書きの詩集です。",
        content:
          "この詩集には、革命家で詩人のグエン・チョン・トゥエンがザーディン刑務所に収監されていた時に書いた38編が収められています。1962年、南ベトナム解放民族戦線の代表団が北部を訪れ、主席に贈りました。南部の人々の思いと、1959年に命を落とした詩人の歩みを伝えます。",
      },
      ko: {
        language_code: "ko",
        title: "쫑뚜옌 시집",
        summary: "1962년 남부 대표단이 호찌민 주석에게 선물한 손글씨 시집입니다.",
        content:
          "이 시집에는 혁명가이자 시인인 응우옌쫑뚜옌이 자딘 감옥에 수감되어 있을 때 쓴 시 38편이 담겨 있습니다. 1962년 남베트남민족해방전선 대표단이 북부를 방문해 호찌민 주석에게 전달했습니다. 남부 주민들의 마음과 1959년 세상을 떠난 시인의 이야기를 전합니다.",
      },
    },
  },
  {
    slug: "bao-linh-kach-menh-so-2",
    image_url: placeholderImage,
    translations: {
      vi: {
        language_code: "vi",
        title: "Báo Lính kách mệnh số 2",
        summary: "Số báo cách mạng in giấy sáp tại Quảng Châu vào tháng 2/1927.",
        content:
          "Báo Lính kách mệnh do Nguyễn Ái Quốc khởi xướng tại Quảng Châu nhằm tuyên truyền và giác ngộ binh lính người Việt. Số 2 được phát hành trong tháng 2/1927, in khổ nhỏ trên giấy sáp để có thể lưu hành bí mật. Tờ báo cho thấy vai trò của báo chí trong việc tổ chức và cổ vũ phong trào cách mạng.",
      },
      en: {
        language_code: "en",
        title: "Lính Kách Mệnh, Issue No. 2",
        summary: "A revolutionary newspaper printed on waxed paper in Guangzhou in February 1927.",
        content:
          "Nguyen Ai Quoc initiated Lính Kách Mệnh in Guangzhou to inform and engage Vietnamese soldiers. Issue No. 2 appeared in February 1927, printed in a small format on waxed paper for covert circulation. The paper illustrates how publishing supported the organization and encouragement of the revolutionary movement.",
      },
      zh: {
        language_code: "zh",
        title: "《革命士兵》第2期",
        summary: "1927年2月在广州以蜡纸印制的一份革命报刊。",
        content:
          "阮爱国在广州发起《革命士兵》，旨在向越南士兵宣传并启发其思想。第2期于1927年2月出版，采用小开本蜡纸印刷，便于秘密传阅。这份报纸体现了出版物在组织和鼓舞革命运动中的作用。",
      },
      ja: {
        language_code: "ja",
        title: "『革命兵士』第2号",
        summary: "1927年2月、広州で蝋紙に印刷された革命新聞です。",
        content:
          "グエン・アイ・クォックは、ベトナム人兵士への宣伝と啓発を目的に広州で『革命兵士』を創刊しました。第2号は1927年2月に、小型の蝋紙印刷で秘密裏に配布されました。この新聞は、出版物が革命運動の組織化と鼓舞に果たした役割を伝えます。",
      },
      ko: {
        language_code: "ko",
        title: "‘혁명 병사’ 제2호",
        summary: "1927년 2월 광저우에서 밀랍종이에 인쇄한 혁명 신문입니다.",
        content:
          "응우옌아이꾸옥은 베트남 병사들에게 소식을 알리고 사상을 일깨우기 위해 광저우에서 ‘혁명 병사’를 창간했습니다. 제2호는 1927년 2월 작은 판형의 밀랍종이에 인쇄되어 비밀리에 유통되었습니다. 이 신문은 출판물이 혁명 운동을 조직하고 고무한 역할을 보여 줍니다.",
      },
    },
  },
  {
    slug: "bo-do-an-chu-tich-ho-chi-minh",
    image_url: placeholderImage,
    translations: {
      vi: {
        language_code: "vi",
        title: "Bộ đồ ăn của Chủ tịch Hồ Chí Minh",
        summary: "Những vật dụng dùng trong bữa ăn hằng ngày tại Phủ Chủ tịch.",
        content:
          "Bộ đồ ăn gồm các vật dụng quen thuộc như bát, đĩa, mâm, thìa và đũa, được Chủ tịch Hồ Chí Minh sử dụng khi sống và làm việc tại Phủ Chủ tịch. Bữa ăn thường ngày giản dị với cơm, rau và các món quen thuộc của người Việt. Hiện vật gợi nhắc nếp sống tiết kiệm và sự trân trọng thành quả lao động.",
      },
      en: {
        language_code: "en",
        title: "President Ho Chi Minh's Tableware",
        summary: "Everyday dining items used at the Presidential Palace.",
        content:
          "The set includes familiar items such as bowls, plates, a tray, spoons and chopsticks, used by President Ho Chi Minh while living and working at the Presidential Palace. His everyday meals were simple, with rice, vegetables and common Vietnamese dishes. The objects recall a practice of frugality and respect for people's labor.",
      },
      zh: {
        language_code: "zh",
        title: "胡志明主席的餐具",
        summary: "胡志明主席在主席府日常使用的餐具。",
        content:
          "这套餐具包括碗、盘、托盘、勺子和筷子等日常用品，胡志明主席居住并工作于主席府期间曾使用它们。他的日常饮食简单，以米饭、蔬菜和常见越南菜肴为主。这些物品让人想到节俭的生活方式以及对劳动成果的珍惜。",
      },
      ja: {
        language_code: "ja",
        title: "ホー・チ・ミン主席の食器",
        summary: "主席府での日常生活に使われた食器です。",
        content:
          "この食器一式には、茶碗、皿、盆、スプーン、箸などが含まれ、ホー・チ・ミン主席が主席府で生活し執務していた時に使われました。日々の食事は米や野菜など、ベトナムで親しまれている料理を中心とした質素なものでした。節約と人々の労働への敬意を伝える品々です。",
      },
      ko: {
        language_code: "ko",
        title: "호찌민 주석의 식기",
        summary: "주석궁에서 일상적으로 사용한 식기류입니다.",
        content:
          "이 식기 세트에는 밥그릇, 접시, 쟁반, 숟가락과 젓가락 등 호찌민 주석이 주석궁에서 생활하고 일할 때 사용한 물건이 포함됩니다. 일상 식사는 밥과 채소, 베트남의 평범한 음식으로 소박하게 차렸습니다. 이 유물은 절약과 노동의 결실을 소중히 여기는 태도를 전합니다.",
      },
    },
  },
  {
    slug: "tui-dung-com-nuoc-ho-chi-minh",
    image_url: placeholderImage,
    translations: {
      vi: {
        language_code: "vi",
        title: "Túi đựng cơm và nước uống",
        summary: "Chiếc túi Chủ tịch Hồ Chí Minh mang theo trong các chuyến công tác từ năm 1957 đến 1965.",
        content:
          "Văn phòng Phủ Chủ tịch mua chiếc túi tại Hà Nội năm 1957. Chủ tịch Hồ Chí Minh dùng túi để mang cơm và nước trong các chuyến đi địa phương đến tháng 8/1965; năm 1980, Văn phòng bàn giao hiện vật cho Bảo tàng Hồ Chí Minh. Túi làm từ vải, giấy và da, với các ngăn bên trong để sắp xếp đồ dùng.",
      },
      en: {
        language_code: "en",
        title: "The Meal and Water Bag",
        summary: "A bag President Ho Chi Minh carried on work trips from 1957 to 1965.",
        content:
          "The Presidential Office bought the bag in Hanoi in 1957. President Ho Chi Minh used it to carry food and water on visits to local communities until August 1965; the office transferred it to the Ho Chi Minh Museum in 1980. Made from fabric, paper and leather, it has inner compartments for organizing its contents.",
      },
      zh: {
        language_code: "zh",
        title: "装饭和饮水的旅行袋",
        summary: "胡志明主席1957年至1965年外出工作时携带的袋子。",
        content:
          "主席府办公室于1957年在河内购入这只旅行袋。胡志明主席在赴地方工作时用它携带饭食和饮水，直到1965年8月；1980年，办公室将其移交给胡志明博物馆。袋子由布、纸和皮革制成，内部设有隔层以便收纳。",
      },
      ja: {
        language_code: "ja",
        title: "食事と飲み物を入れたバッグ",
        summary: "1957年から1965年まで、出張の際にホー・チ・ミン主席が携帯したバッグです。",
        content:
          "主席府事務局は1957年にハノイでこのバッグを購入しました。主席は地方への出張で食事と飲み物を運ぶため、1965年8月まで使用しました。1980年に事務局からホー・チ・ミン博物館へ引き渡されました。布、紙、革で作られ、内側に仕切りがあります。",
      },
      ko: {
        language_code: "ko",
        title: "식사와 물을 담은 가방",
        summary: "1957년부터 1965년까지 호찌민 주석이 출장 때 휴대한 가방입니다.",
        content:
          "주석궁 사무실은 1957년 하노이에서 이 가방을 구입했습니다. 호찌민 주석은 지방 방문 때 음식과 물을 담아 1965년 8월까지 사용했습니다. 1980년 사무실이 호찌민 박물관에 인계했습니다. 천, 종이, 가죽으로 만들었으며 내부에 수납 칸이 있습니다.",
      },
    },
  },
  {
    slug: "doi-guoc-go-ho-chi-minh",
    image_url: placeholderImage,
    translations: {
      vi: {
        language_code: "vi",
        title: "Đôi guốc gỗ mộc",
        summary: "Đồ dùng hằng ngày của Chủ tịch Hồ Chí Minh tại Phủ Chủ tịch từ năm 1958.",
        content:
          "Đôi guốc dài 24,5 cm được làm thủ công từ gỗ, với quai bằng cao su và các miếng đệm khác nhau ở mỗi chiếc. Chủ tịch Hồ Chí Minh sử dụng guốc từ năm 1958 khi đi lại trong khu Phủ Chủ tịch, thường đặt chúng dưới cầu thang nhà sàn. Dấu mòn trên hiện vật gợi lại một nếp sinh hoạt giản dị.",
      },
      en: {
        language_code: "en",
        title: "The Plain Wooden Clogs",
        summary: "Everyday footwear used by President Ho Chi Minh at the Presidential Palace from 1958.",
        content:
          "The pair is 24.5 cm long and was hand-carved from wood, with rubber-fabric straps and different padding on each clog. President Ho Chi Minh used them around the Presidential Palace from 1958 and often left them beneath the stilt-house stairs. Their worn surfaces recall a simple daily routine.",
      },
      zh: {
        language_code: "zh",
        title: "朴素的木屐",
        summary: "胡志明主席自1958年起在主席府日常穿用的木屐。",
        content:
          "这双木屐长24.5厘米，由木料手工削制，配有橡胶布鞋带，两只鞋的衬垫有所不同。胡志明主席自1958年起在主席府内穿着它们，常将木屐放在高脚屋楼梯下。鞋上的磨损痕迹记录了朴素的日常生活。",
      },
      ja: {
        language_code: "ja",
        title: "素朴な木製サンダル",
        summary: "1958年から主席府でホー・チ・ミン主席が日常的に使った履物です。",
        content:
          "長さ24.5センチの一足は木を手作業で削って作られ、ゴム布の鼻緒と、左右で異なる当て材が付いています。主席は1958年から主席府内で履き、高床式の家の階段下に置くこともありました。使い込まれた跡が、素朴な日常を伝えます。",
      },
      ko: {
        language_code: "ko",
        title: "소박한 나무 나막신",
        summary: "1958년부터 주석궁에서 호찌민 주석이 일상적으로 신은 신발입니다.",
        content:
          "길이 24.5cm인 이 나막신은 나무를 손으로 깎아 만들었고, 고무 천으로 된 끈과 양쪽이 서로 다른 덧댐이 있습니다. 호찌민 주석은 1958년부터 주석궁 안에서 신었으며, 목조 주택 계단 아래에 두곤 했습니다. 닳은 흔적은 소박한 일상을 전합니다.",
      },
    },
  },
  {
    slug: "tranh-co-dong-cach-mang-thang-tam",
    image_url: placeholderImage,
    translations: {
      vi: {
        language_code: "vi",
        title: "Tranh cổ động Cách mạng Tháng Tám và Quốc khánh 2/9",
        summary: "Tác phẩm của họa sĩ Nguyễn Phúc Khôi về tinh thần độc lập và ngày Quốc khánh.",
        content:
          "Bức tranh bột màu trên giấy, kích thước 60 × 70 cm, do họa sĩ Nguyễn Phúc Khôi sáng tác. Tác phẩm kết hợp hình ảnh Chủ tịch Hồ Chí Minh, nhân dân giành chính quyền tại Hà Nội và lễ đọc Tuyên ngôn Độc lập ngày 2/9/1945. Sau một triển lãm tại Bảo tàng Hồ Chí Minh năm 2004, họa sĩ tặng tranh cho bảo tàng lưu giữ.",
      },
      en: {
        language_code: "en",
        title: "Poster on the August Revolution and National Day",
        summary: "Artist Nguyen Phuc Khoi's work celebrates independence and Vietnam's National Day.",
        content:
          "Artist Nguyen Phuc Khoi made this 60 by 70 cm poster using opaque watercolor on paper. It combines images of President Ho Chi Minh, Hanoi residents taking power, and the 2 September 1945 Declaration of Independence. After an exhibition at the Ho Chi Minh Museum in 2004, the artist donated the work to the museum.",
      },
      zh: {
        language_code: "zh",
        title: "八月革命与国庆日宣传画",
        summary: "画家阮福魁的作品，展现独立精神与越南国庆日。",
        content:
          "画家阮福魁以不透明水彩在纸上创作了这幅60×70厘米的宣传画。画面结合了胡志明主席、河内人民夺取政权以及1945年9月2日宣读《独立宣言》的场景。作品于2004年在胡志明博物馆展出后，由画家捐赠给博物馆收藏。",
      },
      ja: {
        language_code: "ja",
        title: "八月革命と国慶節の宣伝画",
        summary: "グエン・フック・コイ画家が独立と国慶節を描いた作品です。",
        content:
          "グエン・フック・コイ画家が紙にガッシュで描いた、60×70センチの宣伝画です。ホー・チ・ミン主席、ハノイ市民による政権獲得、1945年9月2日の独立宣言朗読を一つの画面に表しています。2004年にホー・チ・ミン博物館で展示された後、画家から寄贈されました。",
      },
      ko: {
        language_code: "ko",
        title: "8월 혁명과 국경일 포스터",
        summary: "응우옌푹코이 화가가 독립 정신과 국경일을 그린 작품입니다.",
        content:
          "응우옌푹코이 화가가 종이에 과슈로 그린 60×70cm 크기의 포스터입니다. 호찌민 주석, 하노이 시민들의 정권 획득, 1945년 9월 2일 독립선언서 낭독 장면을 한 화면에 담았습니다. 2004년 호찌민 박물관 전시 뒤 작가가 박물관에 기증했습니다.",
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
