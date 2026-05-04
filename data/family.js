window.FAMILY = {
  roots: ["sergey-kuteinikov"],
  people: {
    "sergey-kuteinikov": {
      name: "Сергей Иванович Кутейников",
      dates: "даты неизвестны",
      partners: ["maria-kuteinikova"],
      children: ["anna-kuteinikova"],
      notes: ["Отец Анны Сергеевны Кутейниковой."]
    },
    "maria-kuteinikova": {
      name: "Мария Кутейникова",
      dates: "даты неизвестны",
      partners: ["sergey-kuteinikov"],
      children: ["anna-kuteinikova"],
      notes: ["Мать Анны Сергеевны Кутейниковой."]
    },
    "anna-kuteinikova": {
      name: "Анна Сергеевна Кутейникова",
      dates: "18.07.1899 – 02.02.1990",
      parents: ["sergey-kuteinikov", "maria-kuteinikova"],
      partners: ["dmitry-kurenev"],
      children: ["natalya-kureneva", "vera-kureneva", "elizaveta-kureneva", "alexandra-kureneva"],
      memoirs: ["воспоминания-веры-дмитриевны-подковцевой", "русская-печь", "семейные-хроники"],
      notes: ["Дочь Сергея Ивановича и Марии Кутейниковых.", "Жена Дмитрия Андреевича Куренёва."]
    },
    "dmitry-kurenev": {
      name: "Дмитрий Андреевич Куренёв",
      dates: "08.11.1895 – 13.02.1953",
      partners: ["anna-kuteinikova"],
      children: ["natalya-kureneva", "vera-kureneva", "elizaveta-kureneva", "alexandra-kureneva"],
      memoirs: ["воспоминания-веры-дмитриевны-подковцевой", "семейные-хроники"],
      notes: ["Муж Анны Сергеевны Кутейниковой."]
    },
    "natalya-kureneva": {
      name: "Наталья Дмитриевна Куренёва",
      dates: "27.09.1921 – 08.02.1976",
      parents: ["anna-kuteinikova", "dmitry-kurenev"],
      partners: ["nikolay-grigoryev"],
      children: ["tamara-grigoryeva", "igor-grigoryev"],
      memoirs: ["наташа", "семейные-хроники", "родители"],
      notes: ["Жена Николая Дмитриевича Григорьева."]
    },
    "vera-kureneva": {
      name: "Вера Дмитриевна Куренева",
      dates: "18.08.1923 – 20.10.2017",
      parents: ["anna-kuteinikova", "dmitry-kurenev"],
      partners: ["nikolay-podkovtsev"],
      children: ["elena-podkovtseva"],
      memoirs: ["воспоминания-веры-дмитриевны-подковцевой", "русская-печь"],
      notes: ["Жена Николая Павловича Подковцева."]
    },
    "elizaveta-kureneva": {
      name: "Елизавета Дмитриевна Куренёва",
      dates: "умерла в 6 лет",
      parents: ["anna-kuteinikova", "dmitry-kurenev"],
      notes: ["Дочь Анны Сергеевны Кутейниковой и Дмитрия Андреевича Куренёва."]
    },
    "alexandra-kureneva": {
      name: "Александра Дмитриевна Куренева",
      dates: "29.12.1927 – 02.03.2011",
      parents: ["anna-kuteinikova", "dmitry-kurenev"],
      partners: ["alexander-fateev"],
      children: ["konstantin-fateev", "pavel-fateev"],
      notes: ["Жена Александра Константиновича Фатеева."]
    },
    "nikolay-podkovtsev": {
      name: "Николай Павлович Подковцев",
      dates: "24.12.1924 – 25.08.1991",
      partners: ["vera-kureneva"],
      children: ["elena-podkovtseva"],
      notes: ["Муж Веры Дмитриевны Куреневой."]
    },
    "elena-podkovtseva": {
      name: "Елена Николаевна Подковцева",
      dates: "05.11.1949",
      parents: ["nikolay-podkovtsev", "vera-kureneva"],
      memoirs: ["семейные-хроники"],
      notes: ["Дочь Николая Павловича Подковцева и Веры Дмитриевны Куреневой."]
    },
    "alexander-fateev": {
      name: "Александр Константинович Фатеев",
      dates: "1930 – 2008",
      partners: ["alexandra-kureneva"],
      children: ["konstantin-fateev", "pavel-fateev"],
      notes: ["Муж Александры Дмитриевны Куреневой."]
    },
    "konstantin-fateev": {
      name: "Константин Александрович Фатеев",
      dates: "09.09.1955",
      parents: ["alexandra-kureneva", "alexander-fateev"],
      partners: ["tamara-zhuleva"],
      children: ["anna-fateeva"],
      notes: ["Муж Тамары Антоновны Жулёвой."]
    },
    "tamara-zhuleva": {
      name: "Тамара Антоновна Жулёва",
      dates: "28.11.1958",
      partners: ["konstantin-fateev"],
      children: ["anna-fateeva"],
      notes: ["Жена Константина Александровича Фатеева."]
    },
    "anna-fateeva": {
      name: "Анна Константиновна Фатеева",
      dates: "10.07.1990",
      parents: ["konstantin-fateev", "tamara-zhuleva"],
      notes: ["Дочь Константина Александровича Фатеева и Тамары Антоновны Жулёвой."]
    },
    "pavel-fateev": {
      name: "Павел Александрович Фатеев",
      dates: "11.08.1960",
      parents: ["alexandra-kureneva", "alexander-fateev"],
      partners: ["marina-drozdova", "vera-plitkina"],
      children: ["nikita-fateev", "sasha-fateev"],
      notes: ["Муж Марины Валерьевны Дроздовой.", "Муж Веры Николаевны Плиткиной."]
    },
    "marina-drozdova": {
      name: "Марина Валерьевна Дроздова",
      dates: "23.09.1964",
      partners: ["pavel-fateev"],
      children: ["nikita-fateev"],
      notes: ["Жена Павла Александровича Фатеева."]
    },
    "vera-plitkina": {
      name: "Вера Николаевна Плиткина",
      dates: "23.04.1986",
      partners: ["pavel-fateev"],
      children: ["sasha-fateev"],
      notes: ["Жена Павла Александровича Фатеева."]
    },
    "nikita-fateev": {
      name: "Никита Павлович Фатеев",
      dates: "31.07.1987",
      parents: ["pavel-fateev", "marina-drozdova"],
      partners: ["daryana-medvedeva"],
      children: ["daniil-fateev"],
      notes: ["Муж Дарьяны Сергеевны Медведевой."]
    },
    "daryana-medvedeva": {
      name: "Дарьяна Сергеевна Медведева",
      dates: "22.04.1987",
      partners: ["nikita-fateev"],
      children: ["daniil-fateev"],
      notes: ["Жена Никиты Павловича Фатеева."]
    },
    "daniil-fateev": {
      name: "Даниил Фатеев",
      dates: "02.03.2017",
      parents: ["nikita-fateev", "daryana-medvedeva"],
      notes: ["Сын Никиты Павловича Фатеева и Дарьяны Сергеевны Медведевой."]
    },
    "sasha-fateev": {
      name: "Саша Фатеев",
      dates: "13.05.2016",
      parents: ["pavel-fateev", "vera-plitkina"],
      notes: ["Ребёнок Павла Александровича Фатеева и Веры Николаевны Плиткиной."]
    },
    "nikolay-grigoryev": {
      name: "Николай Дмитриевич Григорьев",
      dates: "19.12.1914 – 19.04.1994",
      partners: ["natalya-kureneva"],
      children: ["tamara-grigoryeva", "igor-grigoryev"],
      memoirs: ["родители"],
      notes: ["Муж Натальи Дмитриевны Куренёвой."]
    },
    "tamara-grigoryeva": {
      name: "Тамара Николаевна Григорьева / Повалюхина",
      dates: "24.12.1946",
      parents: ["natalya-kureneva", "nikolay-grigoryev"],
      partners: ["igor-povalyukhin"],
      children: ["oleg-povalyukhin", "anatoly-povalyukhin"],
      memoirs: ["семейные-хроники", "отец", "родители"],
      notes: ["Жена Игоря Петровича Повалюхина."]
    },
    "igor-grigoryev": {
      name: "Игорь Николаевич Григорьев",
      dates: "20.11.1958 – 19.06.1993",
      parents: ["natalya-kureneva", "nikolay-grigoryev"],
      notes: ["Сын Николая Дмитриевича Григорьева и Натальи Дмитриевны Куренёвой."]
    },
    "igor-povalyukhin": {
      name: "Игорь Петрович Повалюхин",
      dates: "23.03.1947 – 21.05.2014",
      partners: ["tamara-grigoryeva"],
      children: ["oleg-povalyukhin", "anatoly-povalyukhin"],
      memoirs: ["отец"],
      notes: ["Муж Тамары Николаевны Повалюхиной."]
    },
    "oleg-povalyukhin": {
      name: "Олег Игоревич Повалюхин",
      dates: "26.01.1970",
      parents: ["tamara-grigoryeva", "igor-povalyukhin"],
      partners: ["vera-solovyova", "alexandra-pirina", "olga-tankova"],
      children: ["natalya-povalyukhina", "anna-povalyukhina", "maria-povalyukhina"],
      memoirs: ["семейные-хроники"],
      notes: [
        "Сын Тамары Николаевны Повалюхиной и Игоря Петровича Повалюхина.",
        "Муж Веры Дмитриевны Соловьёвой, Александры Сергеевны Пириной и Ольги Александровны Таньковой."
      ]
    },
    "anatoly-povalyukhin": {
      name: "Анатолий Игоревич Повалюхин",
      dates: "15.02.1974 – 31.08.1995",
      parents: ["tamara-grigoryeva", "igor-povalyukhin"],
      memoirs: ["семейные-хроники"],
      notes: ["Сын Тамары Николаевны Повалюхиной и Игоря Петровича Повалюхина."]
    },
    "vera-solovyova": {
      name: "Вера Дмитриевна Соловьёва",
      dates: "20.08.1968",
      partners: ["oleg-povalyukhin"],
      children: ["natalya-povalyukhina"],
      notes: ["Жена Олега Игоревича Повалюхина."]
    },
    "alexandra-pirina": {
      name: "Александра Сергеевна Пирина",
      dates: "17.10.1970",
      partners: ["oleg-povalyukhin"],
      children: ["anna-povalyukhina"],
      notes: ["Жена Олега Игоревича Повалюхина."]
    },
    "olga-tankova": {
      name: "Ольга Александровна Танькова",
      dates: "01.06.1983",
      partners: ["oleg-povalyukhin"],
      children: ["maria-povalyukhina"],
      notes: ["Жена Олега Игоревича Повалюхина."]
    },
    "natalya-povalyukhina": {
      name: "Наталья Олеговна Повалюхина",
      dates: "07.10.1989",
      parents: ["oleg-povalyukhin", "vera-solovyova"],
      partners: ["gerard-hurley"],
      children: ["hawkin-hurley"],
      notes: ["Жена Джерарда Хёрли."]
    },
    "anna-povalyukhina": {
      name: "Анна Олеговна Повалюхина",
      dates: "06.06.2001",
      parents: ["oleg-povalyukhin", "alexandra-pirina"],
      memoirs: ["семейные-хроники"],
      notes: ["Дочь Олега Игоревича Повалюхина и Александры Сергеевны Пириной."]
    },
    "maria-povalyukhina": {
      name: "Мария Олеговна Повалюхина",
      dates: "11.02.2013",
      parents: ["oleg-povalyukhin", "olga-tankova"],
      notes: ["Дочь Олега Игоревича Повалюхина и Ольги Александровны Таньковой."]
    },
    "gerard-hurley": {
      name: "Джерард Хёрли",
      partners: ["natalya-povalyukhina"],
      children: ["hawkin-hurley"],
      notes: ["Муж Натальи Олеговны Повалюхиной."]
    },
    "hawkin-hurley": {
      name: "Хокин Рэндал Хёрли",
      dates: "11.11.2018",
      parents: ["natalya-povalyukhina", "gerard-hurley"],
      notes: ["Сын Натальи Олеговны Повалюхиной и Джерарда Хёрли."]
    }
  }
};
