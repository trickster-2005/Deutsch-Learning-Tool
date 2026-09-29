# Spot checks (spec 15.2)

## stehen (family f13040, root stehen, 48 nodes)

```
stehen VERB A1 z=6.02
    seg: steh:ROOT + en:END
  verstehen VERB A1 z=5.62  <ver- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ver:PREF + steh:ROOT + en:END
    Verständnis NOUN B1 z=4.62  <0 VERB>NOUN  > [stitch:wiktionary-etymology]
        seg: Verständnis:ROOT
      Missverständnis NOUN C1 z=4.0  <miss- NOUN>NOUN  > [stitch:wiktionary-etymology]
          seg: Miss:PREF + verständnis:ROOT
      Unverständnis NOUN C2 z=3.39  <un- NOUN>NOUN  > [dNN21.2]
          seg: Un:PREF + verständnis:ROOT
      verständnisvoll ADJ C2 z=3.3  <-voll NOUN>ADJ relational_adj > [stitch:wiktionary-etymology]
          seg: verständnis:ROOT + voll:SUFF
    missverstehen VERB C1 z=3.68  <miss- VERB>VERB prefixed_verb > [stitch:prefix]
        seg: miss:PREF + ver:PREF + steh:ROOT + en:END
      missverständlich ADJ beyond z=2.98 (path)  <0 VERB>ADJ  > [stitch:wiktionary-etymology]
          seg: missverständlich:ROOT
        unmissverständlich ADJ C2 z=3.38  <un- ADJ>ADJ  > [stitch:nominal-prefix]
            seg: un:PREF + missverständlich:ROOT
  bestehen VERB A1 z=5.49  <be- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: be:PREF + steh:ROOT + en:END
    bestehend ADJ B1 z=4.73  <0 VERB>ADJ  > [dVA02]
        seg: be:PREF + steh:ROOT + end:END
    fort|bestehen VERB C1 z=3.76  <fort- VERB>VERB prefixed_verb > [stitch:prefix]
        seg: fort:PREF_SEP + be:PREF + steh:ROOT + en:END
  entstehen VERB A1 z=5.24  <ent- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ent:PREF + steh:ROOT + en:END
    Entstehung NOUN B2 z=4.31  <-ung VERB>NOUN action_noun > [dVN07]
        seg: Ent:PREF + steh:ROOT + ung:SUFF
    entstehend ADJ C1 z=3.95  <0 VERB>ADJ  > [dVA02]
        seg: ent:PREF + steh:ROOT + end:END
  auf|stehen VERB A2 z=4.94  <auf- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: auf:PREF_SEP + steh:ROOT + en:END
  Stehen NOUN A2 z=4.91  <0 VERB>NOUN nominalized_infinitive > [dVN09]
      seg: Steh:ROOT + en:END
  zu|stehen VERB B2 z=4.53  <zu- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: zu:PREF_SEP + steh:ROOT + en:END
  stehend ADJ B2 z=4.51  <0 VERB>ADJ  > [dVA02]
      seg: steh:ROOT + end:END
  an|stehen VERB B2 z=4.38  <an- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: an:PREF_SEP + steh:ROOT + en:END
    anstehend ADJ C1 z=3.83  <0 VERB>ADJ  > [dVA02]
        seg: an:PREF_SEP + steh:ROOT + end:END
  da|stehen VERB B2 z=4.19  <da- VERB>VERB prefixed_verb > [stitch:wiktionary-etymology]
      seg: da:PREF_SEP + steh:ROOT + en:END
  gestehen VERB B2 z=4.19  <ge- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ge:PREF + steh:ROOT + en:END
    ein|gestehen VERB C1 z=4.07  <ein- VERB>VERB prefixed_verb > [dVV22.1]
        seg: ein:PREF_SEP + ge:PREF + steh:ROOT + en:END
    zu|gestehen VERB C1 z=3.94  <zu- VERB>VERB prefixed_verb > [stitch:prefix]
        seg: zu:PREF_SEP + ge:PREF + steh:ROOT + en:END
  widerstehen VERB B2 z=4.16  <wider- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: wider:PREF + steh:ROOT + en:END
    unwiderstehlich ADJ C2 z=3.41  <un-+-lich VERB>ADJ relational_adj > [stitch:wiktionary-etymology]
        seg: un:PREF + wider:PREF + steh:ROOT + lich:SUFF
  überstehen VERB B2 z=4.16  <über- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: über:PREF + steh:ROOT + en:END
  fest|stehen VERB C1 z=4.01  <fest- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: fest:PREF_SEP + steh:ROOT + en:END
    feststehend ADJ C2 z=3.22  <0 VERB>ADJ  > [dVA02]
        seg: fest:PREF_SEP + steh:ROOT + end:END
  ein|stehen VERB C1 z=3.99  <ein- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ein:PREF_SEP + steh:ROOT + en:END
  bei|stehen VERB C1 z=3.95  <bei- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: bei:PREF_SEP + steh:ROOT + en:END
  aus|stehen VERB C1 z=3.93  <aus- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: aus:PREF_SEP + steh:ROOT + en:END
    ausstehend ADJ C2 z=3.28  <0 VERB>ADJ  > [dVA02]
        seg: aus:PREF_SEP + steh:ROOT + end:END
  vor|stehen VERB C1 z=3.73  <vor- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: vor:PREF_SEP + steh:ROOT + en:END
    bevor|stehen VERB C1 z=3.83  <be- VERB>VERB prefixed_verb > [stitch:prefix]
        seg: be:PREF + vor:PREF_SEP + steh:ROOT + en:END
      bevorstehend ADJ C1 z=3.9  <0 VERB>ADJ  > [dVA02]
          seg: be:PREF + vor:PREF_SEP + steh:ROOT + end:END
    vorstehend ADJ C2 z=3.38  <0 VERB>ADJ  > [dVA02]
        seg: vor:PREF_SEP + steh:ROOT + end:END
    Vorsteher NOUN C2 z=3.3  <-er VERB>NOUN agent_noun > [dVN03]
        seg: Vor:PREF_SEP + steh:ROOT + er:SUFF
  nach|stehen VERB C1 z=3.68  <nach- VERB>VERB prefixed_verb > [dVV33.1]
      seg: nach:PREF_SEP + steh:ROOT + en:END
  unterstehen VERB C2 z=3.65  <unter- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: unter:PREF + steh:ROOT + en:END
  durch|stehen VERB C2 z=3.59  <durch- VERB>VERB prefixed_verb > [dVV31.1]
      seg: durch:PREF_SEP + steh:ROOT + en:END
  ab|stehen VERB C2 z=3.53  <ab- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ab:PREF_SEP + steh:ROOT + en:END
  erstehen VERB C2 z=3.46  <er- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: er:PREF + steh:ROOT + en:END
    auf|erstehen VERB C1 z=3.74  <auf- VERB>VERB prefixed_verb > [stitch:prefix]
        seg: auf:PREF_SEP + er:PREF + steh:ROOT + en:END
      Auferstehung NOUN C2 z=3.62  <-ung VERB>NOUN action_noun > [dVN07]
          seg: Auf:PREF_SEP + er:PREF + steh:ROOT + ung:SUFF
  herum|stehen VERB C2 z=3.3  <herum- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: herum:PREF_SEP + steh:ROOT + en:END
  zusammen|stehen VERB beyond z=3.03  <zusammen- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: zusammen:PREF_SEP + steh:ROOT + en:END
```

| key | article | plural | principal parts | aux | conj | prefix | gloss_en | gloss_zh |
|---|---|---|---|---|---|---|---|---|
| stehen |  |  | steht · stand · gestanden | both | strong | none | to stand; to be, to stand | 站，站立（直立，以直立姿勢支撐自己）；在，立，放置（以直立姿勢放置或位於某處） |
| überstehen |  |  |  | unknown | unknown | unknown | to endure, to overcome, to survive, to pull through; to protrude, to jut out | 經受住、挺住、克服、渡過、戰勝 |
| zustehen |  |  | steht zu · stand zu · zugestanden | both | strong | separable | to be entitled | 有權、應得 |
| widerstehen |  |  | widersteht · widerstand · widerstanden | haben | strong | inseparable | to withstand, to resist | 抵抗、經受住 |
| unwiderstehlich |  |  |  |  |  |  | irresistible | 不可抗拒的，令人傾倒的，有巨大誘惑力的 |
| vorstehen |  |  | steht vor · stand vor · vorgestanden | both | strong | separable | to head, to be in charge of; to stick out; to protrude | 突出、前伸；領導、主管 |
| vorstehend |  |  |  |  |  |  | above-mentioned | 突出的，伸出的，上述的，上列的 |
| Vorsteher | der | Vorsteher |  |  |  |  | provost | 首長，領導，主管，頭，負責校政人員，主監督，牧師，監獄看守，憲兵司令 |
| bevorstehen |  |  | steht bevor · stand bevor · bevorgestanden | both | strong | separable | to be imminent, to impend; to threaten | 即將到來，迫近，臨近 [接 與格]；威脅 [接 與格] |
| bevorstehend |  |  |  |  |  |  | imminent, impending; approaching, upcoming, forthcoming | adv. 接近的，靠近的，到來的，即將來臨的，不久，隨即 |
| verstehen |  |  | versteht · verstand · verstanden | haben | strong | inseparable | to hear and interpret; to comprehend, to make sense of | 理解，懂得；理解自己 |
| missverstehen |  |  | missversteht · missverstand · missverstanden | haben | strong | inseparable | to misunderstand, to misapprehend | 誤會 |
| missverständlich |  |  |  |  |  |  | misleading | 誤導人的，易被誤解的，意義模糊的 |
| unmissverständlich |  |  |  |  |  |  | unambiguous, unequivocal, unapologetic; not misunderstandable | 明確的，不含糊的；不會產生誤解的 |
| Verständnis | das | Verständnisse |  |  |  |  | understanding, comprehension; sympathy | 理解，領會，理解力；體諒，同情，諒解 |
| Missverständnis | das | Missverständnisse |  |  |  |  | misunderstanding, misinterpretation | 誤會，誤解 |
| verständnisvoll |  |  |  |  |  |  | understanding, sympathetic, tolerant | 充分理解的，會意的 |
| Unverständnis | das | Unverständnisse |  |  |  |  | incomprehension | 不理解，不領會，缺乏諒解，不獲賞識，無人欣賞 |
| unterstehen |  |  |  | unknown | unknown | unknown | [with dative] to be subordinate to; to dare, to have the audacity | 隸屬於，從屬於；敢於，膽敢 |
| stehend |  |  |  |  |  |  | standing, waiting; stationary | 站著的，直立的，豎立的；等待的；靜止的，固定的 |
| nachstehen |  |  | steht nach · stand nach · nachgestanden | haben | strong | separable | to be inferior | 居於次位，遜色於，亞於，不如（某人/某物） |
| durchstehen |  |  | steht durch · stand durch · durchgestanden | haben | strong | separable | to endure | 忍受；經歷 |
| Stehen | das |  |  |  |  |  |  |  |
| gestehen |  |  | gesteht · gestand · gestanden | haben | strong | inseparable | to confess, to admit; to make known | 坦白，供認，承認，招認（錯誤、不當行為、令人尷尬的事）；公開 |
| eingestehen |  |  | gesteht ein · gestand ein · eingestanden | haben | strong | separable | to admit, confess, concede, acknowledge | 承認，供認 |
| zugestehen |  |  | gesteht zu · gestand zu · zugestanden | haben | strong | separable | to concede | 給予；承認 |
| erstehen |  |  | ersteht · erstand · erstanden | haben | strong | inseparable | to buy; to arise, to come into being | 買到，獲得；出現，產生，形成，誕生 |
| auferstehen |  |  | aufersteht · auferstand · auferstanden | sein | strong | separable | to be resurrected; to rise from the dead | 復活，死而復生 |
| Auferstehung | die | Auferstehungen |  |  |  |  | resurrection | 復活 |
| entstehen |  |  | entsteht · entstand · entstanden | sein | strong | inseparable | to come into being, to arise, to be produced; to develop | 出現，產生；形成；興起 |
| entstehend |  |  |  |  |  |  | originating, emerging, emerging; nascent | 興起的，新生的 |
| Entstehung | die | Entstehungen |  |  |  |  | creation; origin | 發生、產生、形成、出現、興起、起源 |
| dastehen |  |  | steht da · stand da · dagestanden | both | strong | separable | to stand there; to look, to come across as | 站在那裡；看著像，感覺像 |
| beistehen |  |  | steht bei · stand bei · beigestanden | both | strong | separable | to assist |  |
| abstehen |  |  | steht ab · stand ab · abgestanden | both | strong | separable | to stick out; to be apart | 反對、出眾 |
| zusammenstehen |  |  | steht zusammen · stand zusammen · zusammengestanden | both | unknown | separable |  |  |
| herumstehen |  |  | steht herum · stand herum · herumgestanden | haben | strong | separable | to stand around; to hang around, to loiter | 站著不做事，無所事事，懶散地消磨時間 |
| feststehen |  |  | steht fest · stand fest · festgestanden | both | strong | separable | to stand firm | 確定、規定、肯定、固定 |
| feststehend |  |  |  |  |  |  |  | 固定的，不動的，靜態的 |
| einstehen |  |  | steht ein · stand ein · eingestanden | both | strong | separable | to vouch; to take responsibility | 負責、擔保、答覆 |
| bestehen |  |  | besteht · bestand · bestanden | haben | strong | inseparable | to succeed, to pass; to consist | 通過，（考試）合格，及格；（+aus (“由...”)）組成 |
| fortbestehen |  |  | besteht fort · bestand fort · fortbestanden | both | strong | separable | to linger, to survive | 永存，倖存，繼續存在 |
| bestehend |  |  |  |  |  |  | existing, established | 存在的，現存的 |
| ausstehen |  |  | steht aus · stand aus · ausgestanden | haben | strong | separable | to stand, to endure; to be pending | 忍受；期待中 |
| ausstehend |  |  |  |  |  |  | outstanding, owed as a debt | 未付的，突出的 |
| aufstehen |  |  | steht auf · stand auf · aufgestanden | sein | strong | separable | to get up; to rest | 起身；起床；倚靠在 |
| anstehen |  |  | steht an · stand an · angestanden | sein | strong | separable | to stand in a queue; to be pending, to be upcoming, to be on the agenda, to be… | 排隊；即將到來 |
| anstehend |  |  |  |  |  |  | pending |  |

Compounds with stehen: as modifier [], as head []

## gehen (family f04770, root gehen, 53 nodes)

```
gehen VERB A1 z=6.29
    seg: geh:ROOT + en:END
  aus|gehen VERB A1 z=5.25  <aus- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: aus:PREF_SEP + geh:ROOT + en:END
    voraus|gehen VERB C1 z=3.79  <vor- VERB>VERB prefixed_verb > [dVV27.1]
        seg: vor:PREF_SEP + aus:PREF_SEP + geh:ROOT + en:END
  ein|gehen VERB A2 z=5.02  <ein- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ein:PREF_SEP + geh:ROOT + en:END
    Eingehen NOUN C1 z=3.72  <0 VERB>NOUN nominalized_infinitive > [reoriented:nominalized_infinitive]
        seg: Ein:PREF_SEP + geh:ROOT + en:END
    eingehend ADJ C2 z=3.66  <0 VERB>ADJ  > [dVA02]
        seg: ein:PREF_SEP + geh:ROOT + end:END
  an|gehen VERB A2 z=5.02  <an- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: an:PREF_SEP + geh:ROOT + en:END
    voran|gehen VERB C1 z=3.81  <vor- VERB>VERB prefixed_verb > [dVV27.1]
        seg: vor:PREF_SEP + an:PREF_SEP + geh:ROOT + en:END
    heran|gehen VERB C2 z=3.59  <her- VERB>VERB prefixed_verb > [stitch:prefix]
        seg: her:PREF_SEP + an:PREF_SEP + geh:ROOT + en:END
  Gehen NOUN A2 z=4.91  <0 VERB>NOUN nominalized_infinitive > [dVN09]
      seg: Geh:ROOT + en:END
  vor|gehen VERB A2 z=4.85  <vor- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: vor:PREF_SEP + geh:ROOT + en:END
    hervor|gehen VERB B2 z=4.44  <her- VERB>VERB prefixed_verb > [stitch:prefix]
        seg: her:PREF_SEP + vor:PREF_SEP + geh:ROOT + en:END
    Vorgehen NOUN C1 z=4.11  <0 VERB>NOUN nominalized_infinitive > [reoriented:nominalized_infinitive]
        seg: Vor:PREF_SEP + geh:ROOT + en:END
  weiter|gehen VERB B1 z=4.71  <weiter- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: weiter:PREF_SEP + geh:ROOT + en:END
  umgehen VERB B1 z=4.71  <um- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: um:PREF + geh:ROOT + en:END
    Umgehung NOUN C2 z=3.35  <-ung VERB>NOUN action_noun > [dVN07]
        seg: Um:PREF + geh:ROOT + ung:SUFF
    umgehend ADJ C2 z=3.31  <0 VERB>ADJ  > [dVA02]
        seg: um:PREF + geh:ROOT + end:END
  zurück|gehen VERB B1 z=4.57  <zurück- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: zurück:PREF_SEP + geh:ROOT + en:END
  begehen VERB B1 z=4.53  <be- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: be:PREF + geh:ROOT + en:END
    Begehung NOUN C2 z=3.32  <-ung VERB>NOUN action_noun > [dVN07]
        seg: Be:PREF + geh:ROOT + ung:SUFF
    begehbar ADJ C2 z=3.31  <-bar VERB>ADJ ability_adj > [dVA01]
        seg: be:PREF + geh:ROOT + bar:SUFF
  hin|gehen VERB B2 z=4.51  <hin- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: hin:PREF_SEP + geh:ROOT + en:END
  los|gehen VERB B2 z=4.5  <los- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: los:PREF_SEP + geh:ROOT + en:END
  auf|gehen VERB B2 z=4.48  <auf- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: auf:PREF_SEP + geh:ROOT + en:END
  nach|gehen VERB B2 z=4.43  <nach- VERB>VERB prefixed_verb > [dVV33.1]
      seg: nach:PREF_SEP + geh:ROOT + en:END
  unter|gehen VERB B2 z=4.43  <unter- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: unter:PREF_SEP + geh:ROOT + en:END
  ab|gehen VERB B2 z=4.41  <ab- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ab:PREF_SEP + geh:ROOT + en:END
  zu|gehen VERB B2 z=4.35  <zu- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: zu:PREF_SEP + geh:ROOT + en:END
  vergehen VERB B2 z=4.28  <ver- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ver:PREF + geh:ROOT + en:END
    Vergehen NOUN C2 z=3.65  <0 VERB>NOUN nominalized_infinitive > [reoriented:nominalized_infinitive]
        seg: Ver:PREF + geh:ROOT + en:END
  entgehen VERB B2 z=4.23  <ent- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ent:PREF + geh:ROOT + en:END
  hinaus|gehen VERB B2 z=4.18  <hinaus- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: hinaus:PREF_SEP + geh:ROOT + en:END
  durchgehen VERB C1 z=4.11  <durch- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: durch:PREF + geh:ROOT + en:END
    durchgehend ADJ C1 z=3.81  <0 VERB>ADJ  > [dVA02]
        seg: durch:PREF + geh:ROOT + end:END
  weg|gehen VERB C1 z=4.08  <weg- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: weg:PREF_SEP + geh:ROOT + en:END
  übergehen VERB C1 z=4.08  <über- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: über:PREF + geh:ROOT + en:END
    vorüber|gehen VERB C1 z=3.74  <vor- VERB>VERB prefixed_verb > [dVV27.1]
        seg: vor:PREF_SEP + über:PREF + geh:ROOT + en:END
      vorübergehend ADJ B2 z=4.19  <0 VERB>ADJ  > [dVA02]
          seg: vor:PREF_SEP + über:PREF + geh:ROOT + end:END
  ergehen VERB C1 z=4.01  <er- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: er:PREF + geh:ROOT + en:END
  mit|gehen VERB C1 z=3.94  <mit- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: mit:PREF_SEP + geh:ROOT + en:END
  fort|gehen VERB C2 z=3.64  <fort- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: fort:PREF_SEP + geh:ROOT + en:END
  hinein|gehen VERB C2 z=3.38  <hinein- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: hinein:PREF_SEP + geh:ROOT + en:END
  her|gehen VERB C2 z=3.29  <her- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: her:PREF_SEP + geh:ROOT + en:END
    einher|gehen VERB C1 z=4.05  <ein- VERB>VERB prefixed_verb > [dVV22.1]
        seg: ein:PREF_SEP + her:PREF_SEP + geh:ROOT + en:END
      einhergehend ADJ C2 z=3.52  <0 VERB>ADJ  > [dVA02]
          seg: ein:PREF_SEP + her:PREF_SEP + geh:ROOT + end:END
    vorher|gehen VERB beyond z=2.04 (path)  <vor- VERB>VERB prefixed_verb > [stitch:prefix]
        seg: vor:PREF_SEP + her:PREF_SEP + geh:ROOT + en:END
      vorhergehend ADJ C2 z=3.46  <0 VERB>ADJ  > [dVA02]
          seg: vor:PREF_SEP + her:PREF_SEP + geh:ROOT + end:END
  zusammen|gehen VERB C2 z=3.18  <zusammen- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: zusammen:PREF_SEP + geh:ROOT + en:END
  heim|gehen VERB beyond z=3.14  <heim- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: heim:PREF_SEP + geh:ROOT + en:END
  hintergehen VERB beyond z=3.09  <hinter- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: hinter:PREF + geh:ROOT + en:END
  herum|gehen VERB beyond z=3.03  <herum- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: herum:PREF_SEP + geh:ROOT + en:END
  bei|gehen VERB beyond z=0.0 (path)  <bei- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: bei:PREF_SEP + geh:ROOT + en:END
    vorbei|gehen VERB C1 z=4.07  <vor- VERB>VERB prefixed_verb > [dVV27.1]
        seg: vor:PREF_SEP + bei:PREF_SEP + geh:ROOT + en:END
```

| key | article | plural | principal parts | aux | conj | prefix | gloss_en | gloss_zh |
|---|---|---|---|---|---|---|---|---|
| gehen |  |  | geht · ging · gegangen | sein | strong | none | to go, to walk; to leave | 走，步行；離開，走 |
| übergehen |  |  |  | unknown | unknown | unknown | to skip; to ignore | 跳過，略過；忽略，忽視 |
| vorübergehen |  |  | geht vorüber · ging vorüber · vorübergegangen | sein | strong | separable | to pass by, to pass over, to pass | 走過、經過、過去、消逝 |
| vorübergehend |  |  |  |  |  |  | temporary | 臨時的 |
| weggehen |  |  | geht weg · ging weg · weggegangen | sein | strong | separable | to go away, leave, scram | 走開，離開，外出 |
| untergehen |  |  | geht unter · ging unter · untergegangen | sein | strong | separable | to set; to fall, to go down |  |
| umgehen |  |  |  | unknown | unknown | unknown | to avoid, bypass, to go around; to avoid | 繞過，避開（物理障礙）；無視，避開，避免 |
| umgehend |  |  |  |  |  |  | immediate | 馬上的，立刻的 |
| Umgehung | die | Umgehungen |  |  |  |  | evasion, bypassing; ellipsis of Umgehungsstraße | 旁路 |
| hergehen |  |  | geht her · ging her · hergegangen | sein | strong | separable | to go along; to go along, to take |  |
| vorhergehen |  |  | geht vorher · ging vorher · vorhergegangen | sein | strong | separable | to precede |  |
| vorhergehend |  |  |  |  |  |  | previous, preceding, antecedent, former | adv. 先前的，在前的，上述的，前述的，前面所說的 |
| einhergehen |  |  | geht einher · ging einher · einhergegangen | sein | strong | separable | to accompany | 伴隨 [接 mit (+ 與格) 「某人某物」]；經過，走過 |
| einhergehend |  |  |  |  |  |  | associated, accompanying | 伴隨的，相關的 |
| nachgehen |  |  | geht nach · ging nach · nachgegangen | sein | strong | separable | to follow, to pursue; to run slow | 跟隨、跟蹤、調查、追查、追憶、遷就、放任、（鐘錶）走慢 |
| Gehen | das |  |  |  |  |  |  | 行走；競走 |
| beigehen |  |  | geht bei · ging bei · beigegangen | sein | strong | separable | synonym of drangehen |  |
| vorbeigehen |  |  | geht vorbei · ging vorbei · vorbeigegangen | sein | strong | separable | to go past, to go by; to drop by | 經過 [接 an (+ 與格) 「某人某物」]；順道拜訪 [接 an (+ 與格) 「某人」] |
| begehen |  |  | begeht · beging · begangen | haben | strong | inseparable | to commit, perpetrate; to walk, to walk on, to use | 來，過來，拜訪；做，執行，做（壞事），犯（罪） |
| begehbar |  |  |  |  |  |  | accessible, walk-in | 方便的，靈活的 |
| Begehung | die | Begehungen |  |  |  |  | commission; inspection |  |
| ausgehen |  |  | geht aus · ging aus · ausgegangen | sein | strong | separable | to go out; to run out | 走出去、外出、離開；約會 |
| vorausgehen |  |  | geht voraus · ging voraus · vorausgegangen | sein | strong | separable | to precede, to go ahead | 在...之前（發生），領先於 （+與格）；走在前面，領頭 |
| angehen |  |  | geht an · ging an · angegangen | both | strong | separable | to concern, regard; to tackle; to start; to enter into; to get to work | 關於，涉及；著手處理（問題）；開始（計畫等） |
| vorangehen |  |  | geht voran · ging voran · vorangegangen | sein | strong | separable | to precede; to progress | 走在前面；先於……發生 |
| herangehen |  |  | geht heran · ging heran · herangegangen | sein | strong | separable | to approach | 走近，靠近（步行接近某個（距離不遠的）人或物，向其移動）；著手處理，開始進行（以某種特定方式開始採取行動，「邁出第一步」） |
| zusammengehen |  |  | geht zusammen · ging zusammen · zusammengegangen | sein | strong | separable | to converge | 走到一起，走在一起，合作 |
| zurückgehen |  |  | geht zurück · ging zurück · zurückgegangen | sein | strong | separable | to go back, return; to decline, abate | 走回、回去、降低、下跌 |
| zugehen |  |  | geht zu · ging zu · zugegangen | sein | strong | separable | to shut; to receive | （門窗等）關閉；接近，向...走去 |
| weitergehen |  |  | geht weiter · ging weiter · weitergegangen | sein | strong | separable | to proceed, progress, continue; to keep moving | 繼續往前走，繼續前進；（事情、過程、動作）繼續進行，繼續發展 |
| vorgehen |  |  | geht vor · ging vor · vorgegangen | sein | strong | separable | to walk to the front; to go on ahead | 行動、採取行動、對付、開展、著手、進行、發生 |
| hervorgehen |  |  | geht hervor · ging hervor · hervorgegangen | sein | strong | separable | to result; to follow; to arise | 來自，源於，產生於，出身於，由……得知 |
| Vorgehen | das |  |  |  |  |  | proceeding; procedure | 行動、採取行動、對付、開展、著手、進行 |
| vergehen |  |  | vergeht · verging · vergangen | both | strong | inseparable | to pass, to elapse; to die off, wither, etc. |  |
| Vergehen | das | Vergehen |  |  |  |  | misdemeanor, summary offence |  |
| mitgehen |  |  | geht mit · ging mit · mitgegangen | sein | strong | separable | to come along; to accompany | 給……隨身帶上、捎上；派……陪同，給……配備 |
| losgehen |  |  | geht los · ging los · losgegangen | sein | strong | separable | to leave; to start | 開火、爆炸；開始做、從事 |
| hintergehen |  |  |  | unknown | unknown | unknown | to deceive, to betray, to cheat, to hoodwink, to backstab; to go behind | 欺騙，矇騙；出賣，背叛 [接 賓格]；走到……的後面 |
| hingehen |  |  | geht hin · ging hin · hingegangen | sein | strong | separable | to go; to pass | 去；時間流逝 |
| hineingehen |  |  | geht hinein · ging hinein · hineingegangen | sein | strong | separable | to go in, to go inside |  |
| hinausgehen |  |  | geht hinaus · ging hinaus · hinausgegangen | sein | strong | separable | to go out; to look, to face | 出去；面朝 |
| herumgehen |  |  | geht herum · ging herum · herumgegangen | sein | strong | separable | to walk around, walk about; to go around, circulate | 走來走去，晃盪；（繞著某物）走 |
| heimgehen |  |  | geht heim · ging heim · heimgegangen | sein | strong | separable | to go home; to pass away; to die | 回家；去世，離世 |
| fortgehen |  |  | geht fort · ging fort · fortgegangen | sein | strong | separable | to continue, to go on, to keep on, to carry on; to depart, to take off, to go a… | 繼續進行；離開，離去 |
| ergehen |  |  | ergeht · erging · ergangen | sein | strong | inseparable | to go out, to be issued; to go | 被送出，被髮出；（對某人來說）結果（如何） |
| entgehen |  |  | entgeht · entging · entgangen | sein | strong | inseparable | to slip past; to escape notice | 逃過，逃離；讓...不注意到，被...錯過 [接 與格 「某人」] |
| eingehen |  |  | geht ein · ging ein · eingegangen | sein | strong | separable | to arrive; to contract, to shrivel; to shrink in the wash | 進入 [接 in (+ 賓格)]；被理解，被學會 |
| eingehend |  |  |  |  |  |  | extensive, detailed, thorough, exhaustive; incoming | 詳盡的，深入的，詳細的；進入的，到這裡來的 |
| Eingehen | das |  |  |  |  |  | shrinkage |  |
| durchgehen |  |  |  | unknown | unknown | unknown | to go through; to walk through; to go all the way; to reach as far as | 通過、穿過、直達、不停頓、獲得通過；審查、複核 |
| durchgehend |  |  |  |  |  |  | continuous; permanent | 不停的，持續的，不斷的 |
| aufgehen |  |  | geht auf · ging auf · aufgegangen | sein | strong | separable | to open, come undone; to rise, expand | 開啟；鬆開；為...所知 |
| abgehen |  |  | geht ab · ging ab · abgegangen | sein | strong | separable | to come off, to come loose, to wear off; to leave | Vi. (sein) 脫離、放棄、離開 |

Compounds with gehen: as modifier [], as head []

## sprechen (family f12841, root sprechen, 31 nodes)

```
sprechen VERB A1 z=5.62
    seg: sprech:ROOT + en:END
  an|sprechen VERB A2 z=5.04  <an- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: an:PREF_SEP + sprech:ROOT + en:END
    Ansprache NOUN C1 z=3.77  <0 VERB>NOUN stem_noun ablaut> [dVN08]
        seg: An:PREF_SEP + sprache:ROOT
    ansprechend ADJ C2 z=3.54  <0 VERB>ADJ  > [dVA02]
        seg: an:PREF_SEP + sprech:ROOT + end:END
    ansprechbar ADJ beyond z=3.15  <-bar VERB>ADJ ability_adj > [dVA01]
        seg: an:PREF_SEP + sprech:ROOT + bar:SUFF
  entsprechen VERB A2 z=4.97  <ent- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ent:PREF + sprech:ROOT + en:END
    entsprechend ADJ A1 z=5.13  <0 VERB>ADJ  > [dVA02]
        seg: ent:PREF + sprech:ROOT + end:END
    Entsprechung NOUN C2 z=3.28  <-ung VERB>NOUN action_noun > [dVN07]
        seg: Ent:PREF + sprech:ROOT + ung:SUFF
  aus|sprechen VERB A2 z=4.84  <aus- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: aus:PREF_SEP + sprech:ROOT + en:END
    Aussprache NOUN C1 z=3.89  <0 VERB>NOUN stem_noun ablaut> [dVN08]
        seg: Aus:PREF_SEP + sprache:ROOT
    Ausspruch NOUN C2 z=3.29  <0 VERB>NOUN stem_noun ablaut> [dVN14]
        seg: Aus:PREF_SEP + spruch:ROOT
  versprechen VERB B1 z=4.77  <ver- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ver:PREF + sprech:ROOT + en:END
    Versprechung NOUN C2 z=3.5  <-ung VERB>NOUN action_noun > [dVN07]
        seg: Ver:PREF + sprech:ROOT + ung:SUFF
  Sprechen NOUN B1 z=4.53  <0 VERB>NOUN nominalized_infinitive > [dVN09]
      seg: Sprech:ROOT + en:END
  widersprechen VERB B2 z=4.41  <wider- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: wider:PREF + sprech:ROOT + en:END
    Widerspruch NOUN B2 z=4.41  <0 VERB>NOUN stem_noun ablaut> [dVN14]
        seg: Wider:PREF + spruch:ROOT
      widersprüchlich ADJ C1 z=3.68  <-lich NOUN>ADJ relational_adj umlaut> [dNA01]
          seg: wider:PREF + sprüch:ROOT + lich:SUFF
  Sprecher NOUN B2 z=4.39  <-er VERB>NOUN agent_noun > [dVN03]
      seg: Sprech:ROOT + er:SUFF
    Sprecherin NOUN C1 z=3.73  <-in NOUN>NOUN feminine > [dNN02]
        seg: Sprech:ROOT + er:SUFF + in:SUFF
  besprechen VERB B2 z=4.38  <be- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: be:PREF + sprech:ROOT + en:END
    Besprechung NOUN C1 z=3.87  <-ung VERB>NOUN action_noun > [dVN07]
        seg: Be:PREF + sprech:ROOT + ung:SUFF
  ab|sprechen VERB B2 z=4.25  <ab- VERB>VERB prefixed_verb > [dVV26.1]
      seg: ab:PREF_SEP + sprech:ROOT + en:END
  zu|sprechen VERB B2 z=4.13  <zu- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: zu:PREF_SEP + sprech:ROOT + en:END
    Zuspruch NOUN C2 z=3.57  <0 VERB>NOUN stem_noun ablaut> [dVN14]
        seg: Zu:PREF_SEP + spruch:ROOT
  Spreche NOUN C1 z=3.75  <0 VERB>NOUN stem_noun ablaut> [stitch:conversion]
      seg: Spreche:ROOT
  sprechend ADJ C2 z=3.67  <0 VERB>ADJ  > [dVA02]
      seg: sprech:ROOT + end:END
  vor|sprechen VERB C2 z=3.47  <vor- VERB>VERB prefixed_verb > [dVV27.1]
      seg: vor:PREF_SEP + sprech:ROOT + en:END
  herum|sprechen VERB C2 z=3.39  <herum- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: herum:PREF_SEP + sprech:ROOT + en:END
  Sprech NOUN C2 z=3.3  <0 VERB>NOUN stem_noun > [stitch:conversion]
      seg: Sprech:ROOT
  mit|sprechen VERB beyond z=3.04  <mit- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: mit:PREF_SEP + sprech:ROOT + en:END
  durch|sprechen VERB beyond z=3.02  <durch- VERB>VERB prefixed_verb > [dVV31.1]
      seg: durch:PREF_SEP + sprech:ROOT + en:END
```

| key | article | plural | principal parts | aux | conj | prefix | gloss_en | gloss_zh |
|---|---|---|---|---|---|---|---|---|
| sprechen |  |  | spricht · sprach · gesprochen | haben | strong | none | to speak; to speak, to talk, to give a speech | 說，講；說話，談話 |
| Spreche | die | Sprechen |  |  |  |  |  | 口頭語，語言表達方式 |
| Sprech | der |  |  |  |  |  | jargon, speak |  |
| zusprechen |  |  | spricht zu · sprach zu · zugesprochen | haben | strong | separable | to grant; to comfort | 勸說，同...談話，盡情地享用，vt.對..說出..的話，宣佈..歸..所有，將..判給 |
| Zuspruch | der | Zusprüche |  |  |  |  | encouragement; popularity |  |
| widersprechen |  |  | widerspricht · widersprach · widersprochen | haben | strong | inseparable | to object; to disagree; to contradict | 反駁、反對、矛盾、異議 |
| Widerspruch | der | Widersprüche |  |  |  |  | objection, protest; contradiction | 矛盾、不一致、不和諧、相爭、不同意、不和；對照、正相反、對比 |
| widersprüchlich |  |  |  |  |  |  | contradictory; conflicting | 矛盾的，不一致的 |
| versprechen |  |  | verspricht · versprach · versprochen | haben | strong | inseparable | to promise; to expect; to hope for | 保證、許諾、答應、確保；發錯音 |
| Versprechung | die | Versprechungen |  |  |  |  | promise | 承諾，許諾，約定 |
| vorsprechen |  |  | spricht vor · sprach vor · vorgesprochen | haben | strong | separable | to audition; to pay a visit | 先說（以便複述），領讀，朗誦， vi. 試聽 |
| sprechend |  |  |  |  |  |  |  | 講話的，交談著的，說著的 |
| durchsprechen |  |  | spricht durch · sprach durch · durchgesprochen | haben | unknown | separable |  |  |
| absprechen |  |  | spricht ab · sprach ab · abgesprochen | haben | strong | separable | to arrange, to agree upon; to coordinate; to deny, to dispute | （及物）談妥，約定好，就...達成共識；（及物）否認，對...表示異議，不承認 |
| Sprecher | der | Sprecher |  |  |  |  | one who speaks in a presentation or performance, such as a radio drama or voice… | 說話者、新聞播音員；發言人、演說者 |
| Sprecherin | die | Sprecherinnen |  |  |  |  |  | 女發言人、女播音員 |
| Sprechen | das |  |  |  |  |  |  |  |
| mitsprechen |  |  | spricht mit · sprach mit · mitgesprochen | haben | unknown | separable |  |  |
| herumsprechen |  |  | spricht herum · sprach herum · herumgesprochen | haben | strong | separable | to travel, to get around, to get out |  |
| entsprechen |  |  | entspricht · entsprach · entsprochen | haben | strong | inseparable | to correspond; to meet | 符合、合適、對應、相匹配、與…相符、與…相稱、滿足 |
| entsprechend |  |  |  |  |  |  | corresponding; adequate, appropriate | 對應的、相應的、相當的、與…相符的；合適的、相配的 |
| Entsprechung | die | Entsprechungen |  |  |  |  | equivalent | 等價物，相等物，對等 |
| besprechen |  |  | bespricht · besprach · besprochen | haben | strong | inseparable | to discuss | 討論，商討，商談，評論 |
| Besprechung | die | Besprechungen |  |  |  |  | meeting, discussion; Review | 商談，會談 |
| aussprechen |  |  | spricht aus · sprach aus · ausgesprochen | haben | strong | separable | to pronounce; to be pronounced; to have a certain pronunciation | 宣佈、表示、表達、發音 |
| Ausspruch | der | Aussprüche |  |  |  |  | saying | '-e ①言辭 ②判決 ③評述 |
| Aussprache | die | Aussprachen |  |  |  |  | pronunciation; discussion, debate, talk | 發音、讀音、口音；探討、談話 |
| ansprechen |  |  | spricht an · sprach an · angesprochen | haben | strong | separable | to speak to; to address; to appeal to | 和...說話；引起...的興趣，符合...的趣向，利益等 |
| ansprechend |  |  |  |  |  |  | appealing, attractive, pleasing | 吸引人的，動人的，有魅力的，令人愉悅的 |
| ansprechbar |  |  |  |  |  |  | responsive | 易接近的，親切的，親近的，平易近人的 |
| Ansprache | die | Ansprachen |  |  |  |  | speech, address; toast | 講話，致辭，演講，演說；祝酒，敬酒 |

Compounds with sprechen: as modifier [], as head []

## fahren (family f03803, root fahren, 38 nodes)

```
fahren VERB A1 z=5.71
    seg: fahr:ROOT + en:END
  erfahren VERB A2 z=5.0  <er- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: er:PREF + fahr:ROOT + en:END
    Erfahrung NOUN A1 z=5.2  <-ung VERB>NOUN action_noun > [dVN07]
        seg: Er:PREF + fahr:ROOT + ung:SUFF
  Fahren NOUN B1 z=4.74  <0 VERB>NOUN nominalized_infinitive > [dVN09]
      seg: Fahr:ROOT + en:END
  Fahrer NOUN B1 z=4.72  <-er VERB>NOUN agent_noun > [dVN03]
      seg: Fahr:ROOT + er:SUFF
    Beifahrer NOUN C2 z=3.46  <bei- NOUN>NOUN  > [dNN42.1]
        seg: Bei:PREF + fahr:ROOT + er:SUFF
    Fahrerin NOUN C2 z=3.37  <-in NOUN>NOUN feminine > [dNN02]
        seg: Fahr:ROOT + er:SUFF + in:SUFF
  vor|fahren VERB B1 z=4.57  <vor- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: vor:PREF_SEP + fahr:ROOT + en:END
  ein|fahren VERB B1 z=4.55  <ein- VERB>VERB prefixed_verb > [dVV22.1]
      seg: ein:PREF_SEP + fahr:ROOT + en:END
  verfahren VERB B2 z=4.51  <ver- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ver:PREF + fahr:ROOT + en:END
    Verfahren NOUN B1 z=4.54  <0 VERB>NOUN nominalized_infinitive > [dVN09]
        seg: Ver:PREF + fahr:ROOT + en:END
  an|fahren VERB B2 z=4.46  <an- VERB>VERB prefixed_verb > [dVV13.1]
      seg: an:PREF_SEP + fahr:ROOT + en:END
  ab|fahren VERB B2 z=4.4  <ab- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ab:PREF_SEP + fahr:ROOT + en:END
  aus|fahren VERB B2 z=4.21  <aus- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: aus:PREF_SEP + fahr:ROOT + en:END
  hin|fahren VERB B2 z=4.17  <hin- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: hin:PREF_SEP + fahr:ROOT + en:END
  auf|fahren VERB B2 z=4.15  <auf- VERB>VERB prefixed_verb > [dVV14.1]
      seg: auf:PREF_SEP + fahr:ROOT + en:END
  weiter|fahren VERB C1 z=4.1  <weiter- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: weiter:PREF_SEP + fahr:ROOT + en:END
  überfahren VERB C1 z=4.1  <über- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: über:PREF + fahr:ROOT + en:END
  mit|fahren VERB C1 z=4.06  <mit- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: mit:PREF_SEP + fahr:ROOT + en:END
    Mitfahrer NOUN beyond z=3.13  <-er VERB>NOUN agent_noun > [dVN03]
        seg: Mit:PREF_SEP + fahr:ROOT + er:SUFF
  vorbei|fahren VERB C1 z=4.0  <vor-+bei- VERB>VERB prefixed_verb > [stitch:wiktionary-etymology]
      seg: vor:PREF_SEP + bei:PREF_SEP + fahr:ROOT + en:END
  los|fahren VERB C1 z=3.91  <los- VERB>VERB prefixed_verb > [dVV24.1]
      seg: los:PREF_SEP + fahr:ROOT + en:END
  fort|fahren VERB C1 z=3.9  <fort- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: fort:PREF_SEP + fahr:ROOT + en:END
  durchfahren VERB C1 z=3.81  <durch- VERB>VERB prefixed_verb > [dVV31.1]
      seg: durch:PREF + fahr:ROOT + en:END
  weg|fahren VERB C1 z=3.8  <weg- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: weg:PREF_SEP + fahr:ROOT + en:END
  zurück|fahren VERB C1 z=3.76  <zurück- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: zurück:PREF_SEP + fahr:ROOT + en:END
  nach|fahren VERB C1 z=3.76  <nach- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: nach:PREF_SEP + fahr:ROOT + en:END
  fahrend ADJ C1 z=3.74  <0 VERB>ADJ  > [dVA02]
      seg: fahr:ROOT + end:END
  befahren VERB C2 z=3.63  <be- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: be:PREF + fahr:ROOT + en:END
    befahrbar ADJ C2 z=3.27  <-bar VERB>ADJ ability_adj > [dVA01]
        seg: be:PREF + fahr:ROOT + bar:SUFF
  widerfahren VERB C2 z=3.51  <wider- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: wider:PREF + fahr:ROOT + en:END
  heim|fahren VERB C2 z=3.5  <heim- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: heim:PREF_SEP + fahr:ROOT + en:END
  umfahren VERB C2 z=3.33  <um- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: um:PREF + fahr:ROOT + en:END
  herum|fahren VERB C2 z=3.26  <herum- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: herum:PREF_SEP + fahr:ROOT + en:END
  entfahren VERB C2 z=3.21  <ent- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ent:PREF + fahr:ROOT + en:END
  fahrbar ADJ beyond z=3.06  <-bar VERB>ADJ ability_adj > [dVA01]
      seg: fahr:ROOT + bar:SUFF
  unterfahren VERB beyond z=1.76 (path)  <unter- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: unter:PREF + fahr:ROOT + en:END
    herunter|fahren VERB C2 z=3.43  <her- VERB>VERB prefixed_verb > [stitch:prefix]
        seg: her:PREF_SEP + unter:PREF + fahr:ROOT + en:END
```

| key | article | plural | principal parts | aux | conj | prefix | gloss_en | gloss_zh |
|---|---|---|---|---|---|---|---|---|
| fahren |  |  | fährt · fuhr · gefahren | both | strong | none | to go at speed; to go; to run; to drive; to sail | 開車，駕車，乘車，前往 |
| überfahren |  |  |  | unknown | unknown | unknown | to run over, to run down; to go through, to overshoot | ①壓倒，軋死，軋傷②駛越③對…搞突然襲擊，④把……擺渡過去，④旋得太緊，⑤衝出跑道盡頭，⑥（紅燈）過線 |
| widerfahren |  |  | widerfährt · widerfuhr · widerfahren | sein | strong | inseparable | to befall, to happen to | （事情）降臨，發生 [接 與格 「於某人」]；（人）遭到，遭受 |
| vorfahren |  |  | fährt vor · fuhr vor · vorgefahren | both | strong | separable | to drive up; to drive ahead | 向前行駛，優先行駛 |
| verfahren |  |  | verfährt · verfuhr · verfahren | both | strong | inseparable | to proceed, to deal with; to lose one's way, to get lost | 處理，應付，對待；開車迷路 |
| Verfahren | das | Verfahren |  |  |  |  | procedure, process; proceedings | 方法、流程、程式 |
| unterfahren |  |  |  | unknown | unknown | unknown |  |  |
| herunterfahren |  |  | fährt herunter · fuhr herunter · heruntergefahren | both | strong | separable | to drive down; to shut down | 駕駛……下來，駛下來（向著說話人）；關機，關閉 |
| umfahren |  |  |  | unknown | unknown | unknown | to bypass, avoid; to circle, circumnavigate | 繞開行駛，撞倒，描繪出，vi. 繞行，繞圈子,避開 |
| nachfahren |  |  | fährt nach · fuhr nach · nachgefahren | both | strong | separable | to follow [with dative ‘to someone’]; to follow on | 跟著，跟隨，跟蹤，跟在後面駕駛 |
| mitfahren |  |  | fährt mit · fuhr mit · mitgefahren | sein | strong | separable | to drive with | 一起乘車，搭乘同一交通工具旅行 |
| Mitfahrer | der | Mitfahrer |  |  |  |  |  | 乘客、同車乘客 |
| losfahren |  |  | fährt los · fuhr los · losgefahren | sein | strong | separable | to set off, to hit the road |  |
| fahrend |  |  |  |  |  |  | nomadic; roaming | 駕駛的，推進的，強勁的，精力旺盛的 |
| fahrbar |  |  |  |  |  |  | mobile | 可行駛的，可移動的，可通行車輛的 |
| einfahren |  |  | fährt ein · fuhr ein · eingefahren | both | strong | separable | to drive in; to arrive, to pull in | 駛入，跑入，塞入，縮回 |
| durchfahren |  |  |  | unknown | unknown | unknown | to cross while driving, to traverse, to drive through; to travel through, to ru… | 乘車經過，乘車遊覽， vi. (sein)不停留地一直行駛，直達 |
| auffahren |  |  | fährt auf · fuhr auf · aufgefahren | both | strong | separable | to rear-end, to drive into; to tailgate | （行駛時）碰上，撞上，碰到 |
| anfahren |  |  | fährt an · fuhr an · angefahren | sein | strong | separable | to start moving; to approach, to come driving | 開動、駛來；駛向 |
| Fahrer | der | Fahrer |  |  |  |  |  | 司機、駕駛 |
| Beifahrer | der | Beifahrer |  |  |  |  | front passenger; driver's mate | 同乘者、副駕 |
| Fahrerin | die | Fahrerinnen |  |  |  |  |  |  |
| Fahren | das |  |  |  |  |  |  |  |
| erfahren |  |  | erfährt · erfuhr · erfahren | haben | strong | inseparable | to find out, learn, to come to know; to experience | 學、學習、學會、瞭解知識、發現、經歷、體驗、感受、承擔 |
| Erfahrung | die | Erfahrungen |  |  |  |  | experience | 經歷、經驗 |
| befahren |  |  | befährt · befuhr · befahren | haben | strong | inseparable | to drive on, along; to sail; to cruise; to travel to | 行駛於，航行於 （一條路，一片海，一道鐵軌等）；行至，前往 |
| befahrbar |  |  |  |  |  |  | driveable, navigable, passable, open to traffic | adv. 可行駛的，可行車的，可通過的，可通行的，可通船的，可航行的 |
| ausfahren |  |  | fährt aus · fuhr aus · ausgefahren | both | strong | separable | to go out; to drive out | vt ①坐車出遊 ②用車送交 ③ 空 放(起落架等) ④進行(賽車等)比賽 ⑤因行駛而損壞 |
| weiterfahren |  |  | fährt weiter · fuhr weiter · weitergefahren | sein | strong | separable | to continue driving | 繼續行駛 |
| wegfahren |  |  | fährt weg · fuhr weg · weggefahren | sein | strong | separable | to drive away, to drive off; to drive away, take away with a vehicle |  |
| vorbeifahren |  |  | fährt vorbei · fuhr vorbei · vorbeigefahren | sein | strong | separable | to drive by, to pass | 駛過，駕駛經過 [接 an (+ 與格)] |
| zurückfahren |  |  | fährt zurück · fuhr zurück · zurückgefahren | both | strong | separable | to go back; to drive back | 駛回，返回，（駕車）送回 |
| hinfahren |  |  | fährt hin · fuhr hin · hingefahren | haben | strong | separable | to give a ride [auxiliary haben]; to drive [auxiliary sein] | 駛往，（用手）掠過，拂過，去世，離去， vt. 把...載去，用車把...送去 |
| herumfahren |  |  | fährt herum · fuhr herum · herumgefahren | sein | strong | separable | to drive around [with um]; to turn around suddenly |  |
| heimfahren |  |  | fährt heim · fuhr heim · heimgefahren | both | strong | separable | to drive home |  |
| fortfahren |  |  | fährt fort · fuhr fort · fortgefahren | both | strong | separable | to drive away, drive off; to drive away, remove by means of a vehicle | （車、船）離去、啟程、繼續、運走 |
| entfahren |  |  | entfährt · entfuhr · entfahren | sein | strong | inseparable | to escape; to slip out mouth |  |
| abfahren |  |  | fährt ab · fuhr ab · abgefahren | sein | strong | separable | to depart, to leave; to carry off, to remove | 離開，駛離；拿走，移除 |

Compounds with fahren: as modifier ['Fahrgast', 'Fahrplan', 'Fahrkarte', 'Fahrverbot', 'Fahrstuhl', 'Fahrschule', 'Fahrzeit', 'Fahrwerk', 'Fahrerlaubnis', 'Fahrstreifen'], as head ['Fahrradfahren']

## Haus (family f05766, root Haus, 7 nodes)

```
Haus NOUN A1 z=5.68
    seg: Haus:ROOT
  hausen VERB C1 z=3.9  <0 NOUN>VERB denominal_verb > [stitch:conversion]
      seg: haus:ROOT + en:END
    behausen VERB beyond z=0.0 (path)  <be- VERB>VERB prefixed_verb > [stitch:prefix]
        seg: be:PREF + haus:ROOT + en:END
      Behausung NOUN beyond z=3.12  <-ung VERB>NOUN action_noun > [stitch:wiktionary-etymology]
          seg: Be:PREF + haus:ROOT + ung:SUFF
  häuslich ADJ C1 z=3.84  <-lich NOUN>ADJ relational_adj umlaut> [stitch:wiktionary-etymology]
      seg: häus:ROOT + lich:SUFF
  Häuschen NOUN C1 z=3.69  <-chen NOUN>NOUN diminutive umlaut> [stitch:wiktionary-etymology]
      seg: Häus:ROOT + chen:SUFF
  hauseigen ADJ C2 z=3.29  <-ig+-en NOUN>ADJ material_adj ablaut> [stitch:wiktionary-etymology]
      seg: hause:ROOT + ig:SUFF + en:SUFF
```

| key | article | plural | principal parts | aux | conj | prefix | gloss_en | gloss_zh |
|---|---|---|---|---|---|---|---|---|
| Haus | das | Häuser |  |  |  |  | house, building; home | 房子、住房 |
| häuslich |  |  |  |  |  |  | domestic, homely, household; domesticated | 家庭的；深居簡出的，喜歡待在家裡的 |
| hausen |  |  | haust · hauste · gehaust | haben | weak | none | to dwell, to reside |  |
| behausen |  |  | behaust · behauste · behaust | haben | unknown | inseparable |  |  |
| Behausung | die | Behausungen |  |  |  |  | dwelling, abode | 寓所，住處 |
| hauseigen |  |  |  |  |  |  | in house, housemade | 居室的，居家的，房子的，賓館的，屬於公司的 |
| Häuschen | das | Häuschen |  |  |  |  | outhouse, privy, dunny; toilet | 小屋，門房，帳蓬小屋 |

Compounds with Haus: as modifier ['Haustür', 'Haustier', 'Hausfrau', 'Hausarbeit', 'Hausmeister', 'Hausarzt', 'hausgemacht', 'Hausmann', 'Hausnummer', 'Hausaufgabe'], as head ['Krankenhaus', 'Rathaus', 'Wohnhaus', 'Gasthaus', 'Einfamilienhaus', 'Parkhaus', 'Treppenhaus', 'Hochhaus', 'Elternhaus', 'Abgeordnetenhaus']

## frei (family f04327, root frei, 10 nodes)

```
frei ADJ A1 z=5.21
    seg: frei:ROOT
  Freiheit NOUN A2 z=4.92  <-heit ADJ>NOUN quality_noun > [dAN02]
      seg: Frei:ROOT + heit:SUFF
    freiheitlich ADJ C1 z=3.73  <-lich NOUN>ADJ relational_adj > [dNA01]
        seg: frei:ROOT + heit:SUFF + lich:SUFF
  freien VERB A2 z=4.81  <0 ADJ>VERB deadjectival_verb > [stitch:deadjectival]
      seg: frei:ROOT + en:END
    Frei NOUN B1 z=4.8  <0 VERB>NOUN stem_noun > [stitch:conversion]
        seg: Frei:ROOT
    befreien VERB B2 z=4.5  <be- VERB>VERB prefixed_verb > [stitch:prefix]
        seg: be:PREF + frei:ROOT + en:END
      Befreiung NOUN C1 z=4.07  <-ung VERB>NOUN action_noun > [dVN07]
          seg: Be:PREF + frei:ROOT + ung:SUFF
      befreit ADJ C1 z=3.95  <0 VERB>ADJ  > [dVA13]
          seg: be:PREF + frei:ROOT + t:END
  Freie NOUN B1 z=4.59  <0 ADJ>NOUN nominalized_adjective > [dAN01]
      seg: Frei:ROOT + e:END
    Freier NOUN B2 z=4.15  <-er NOUN>NOUN agent_noun > [dNN05]
        seg: Frei:ROOT + er:SUFF
```

| key | article | plural | principal parts | aux | conj | prefix | gloss_en | gloss_zh |
|---|---|---|---|---|---|---|---|---|
| frei |  |  |  |  |  |  | free; unenslaved; unimprisoned; free; unrestricted; more negative also: unrestr… |  |
| freien |  |  | freit · freite · gefreit | haben | weak | none | Synonym of befreien | （不及物）求婚、追求；（及物）與…結婚 |
| Frei | das |  |  |  |  |  |  |  |
| befreien |  |  | befreit · befreite · befreit | haben | weak | inseparable | to free, to liberate; to escape | 解放、釋放、擺脫、使免除 |
| befreit |  |  |  |  |  |  | freed from something, liberated | 被解放的，被釋放的，被拯救的 |
| Befreiung | die | Befreiungen |  |  |  |  | liberation; exemption | 解放，解救，解除，免除 |
| Freiheit | die | Freiheiten |  |  |  |  | freedom; liberty | 自由 |
| freiheitlich |  |  |  |  |  |  | freedom; in a free way, liberal | 自由的，愛自由的，自由主義的，進步的，改革的，改革主義的，開放的，慷慨的，寬容的 |
| Freie | das | Freie |  |  |  |  | the open | 室外，露天處 |
| Freier | der | Freier |  |  |  |  | john, punter | 起訴者，原告，請願者，懇求的人，求婚者 |

Compounds with frei: as modifier ['Freizeit', 'Freistaat', 'Freibad', 'Freiherr', 'Freiraum', 'Freihandel', 'Freimaurer', 'freizügig', 'Freibier', 'Freikirche'], as head ['fehlerfrei', 'gewaltfrei', 'straffrei', 'zweifelsfrei', 'glutenfrei', 'gebührenfrei']

## schreiben (family f11993, root schreiben, 28 nodes)

```
schreiben VERB A1 z=5.54
    seg: schreib:ROOT + en:END
  beschreiben VERB A2 z=4.92  <be- VERB>VERB prefixed_verb > [dVV02.1]
      seg: be:PREF + schreib:ROOT + en:END
    Beschreibung NOUN B1 z=4.65  <-ung VERB>NOUN action_noun > [dVN07]
        seg: Be:PREF + schreib:ROOT + ung:SUFF
    unbeschreiblich ADJ C2 z=3.45  <un-+-lich VERB>ADJ relational_adj > [stitch:wiktionary-etymology]
        seg: un:PREF + be:PREF + schreib:ROOT + lich:SUFF
  Schreiben NOUN A2 z=4.83  <0 VERB>NOUN nominalized_infinitive > [dVN09]
      seg: Schreib:ROOT + en:END
  unterschreiben VERB B2 z=4.46  <unter- VERB>VERB prefixed_verb > [dVV25.1]
      seg: unter:PREF + schreib:ROOT + en:END
  zu|schreiben VERB B2 z=4.36  <zu- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: zu:PREF_SEP + schreib:ROOT + en:END
    Zuschreibung NOUN beyond z=3.04  <-ung VERB>NOUN action_noun > [stitch:wiktionary-etymology]
        seg: Zu:PREF_SEP + schreib:ROOT + ung:SUFF
  vor|schreiben VERB B2 z=4.3  <vor- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: vor:PREF_SEP + schreib:ROOT + en:END
  an|schreiben VERB B2 z=4.26  <an- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: an:PREF_SEP + schreib:ROOT + en:END
    Anschreiben NOUN C2 z=3.22  <0 VERB>NOUN nominalized_infinitive > [reoriented:nominalized_infinitive]
        seg: An:PREF_SEP + schreib:ROOT + en:END
  auf|schreiben VERB B2 z=4.24  <auf- VERB>VERB prefixed_verb > [dVV14.1]
      seg: auf:PREF_SEP + schreib:ROOT + en:END
  ab|schreiben VERB B2 z=4.13  <ab- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ab:PREF_SEP + schreib:ROOT + en:END
    Abschreibung NOUN C2 z=3.39  <-ung VERB>NOUN action_noun > [dVN07]
        seg: Ab:PREF_SEP + schreib:ROOT + ung:SUFF
  Schreibe NOUN C1 z=4.03  <0 VERB>NOUN stem_noun ablaut> [stitch:wiktionary-etymology]
      seg: Schreibe:ROOT
  Schreiber NOUN C1 z=3.98  <-er VERB>NOUN agent_noun > [dVN03]
      seg: Schreib:ROOT + er:SUFF
  ein|schreiben VERB C1 z=3.97  <ein- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ein:PREF_SEP + schreib:ROOT + en:END
  aus|schreiben VERB C1 z=3.82  <aus- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: aus:PREF_SEP + schreib:ROOT + en:END
    Ausschreibung NOUN C1 z=3.92  <-ung VERB>NOUN action_noun > [dVN07]
        seg: Aus:PREF_SEP + schreib:ROOT + ung:SUFF
  fest|schreiben VERB C1 z=3.78  <fest- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: fest:PREF_SEP + schreib:ROOT + en:END
  verschreiben VERB C1 z=3.71  <ver- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ver:PREF + schreib:ROOT + en:END
  umschreiben VERB C1 z=3.68  <um- VERB>VERB prefixed_verb > [dVV30.1]
      seg: um:PREF + schreib:ROOT + en:END
    Umschreibung NOUN C2 z=3.27  <-ung VERB>NOUN action_noun > [dVN07]
        seg: Um:PREF + schreib:ROOT + ung:SUFF
  überschreiben VERB C2 z=3.52  <über- VERB>VERB prefixed_verb > [dVV29.1]
      seg: über:PREF + schreib:ROOT + en:END
  mit|schreiben VERB C2 z=3.48  <mit- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: mit:PREF_SEP + schreib:ROOT + en:END
  hin|schreiben VERB C2 z=3.22  <hin- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: hin:PREF_SEP + schreib:ROOT + en:END
  Schreibung NOUN beyond z=3.11  <-ung VERB>NOUN action_noun > [dVN07]
      seg: Schreib:ROOT + ung:SUFF
  fort|schreiben VERB beyond z=3.03  <fort- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: fort:PREF_SEP + schreib:ROOT + en:END
```

| key | article | plural | principal parts | aux | conj | prefix | gloss_en | gloss_zh |
|---|---|---|---|---|---|---|---|---|
| schreiben |  |  | schreibt · schrieb · geschrieben | haben | strong | none | to write, to write out; to spell | 寫；撰寫，編寫；拼寫 |
| Schreibe | die | Schreiben |  |  |  |  | writing; style |  |
| zuschreiben |  |  | schreibt zu · schrieb zu · zugeschrieben | haben | strong | separable | to attribute, to ascribe; to credit, impute, refer |  |
| Zuschreibung | die | Zuschreibungen |  |  |  |  | ascription; attribution | 歸因 |
| verschreiben |  |  | verschreibt · verschrieb · verschrieben | haben | strong | inseparable | to prescribe; to make over; to sign over |  |
| überschreiben |  |  |  | unknown | unknown | unknown | to make over; to sign over; to title; to provide something with a heading |  |
| unterschreiben |  |  |  | unknown | unknown | unknown | to sign; to write under or below something |  |
| umschreiben |  |  |  | unknown | unknown | unknown | to rewrite; to transcribe; to transliterate | 說明，解釋，釋義，簡要地說明，簡要地確定，婉言表達 |
| Umschreibung | die | Umschreibungen |  |  |  |  | paraphrase, circumlocution | 改寫，重寫，定義，釋義，意譯，演繹，翻譯，迂迴說法，委婉說法，抄寫，謄寫，界限，區域，轉移，轉讓 |
| beschreiben |  |  | beschreibt · beschrieb · beschrieben | haben | strong | inseparable | to describe; to write on | 寫上、寫滿、描述、畫 |
| unbeschreiblich |  |  |  |  |  |  | indescribable, indefinable; incredible | 無法描述的，難以形容的，難以置信的；非常的 |
| Beschreibung | die | Beschreibungen |  |  |  |  | description | 描述，敘述 |
| aufschreiben |  |  | schreibt auf · schrieb auf · aufgeschrieben | haben | strong | separable | to write down, mark down, to make a note; to mark out | 寫下、記下、開藥方 |
| Schreibung | die | Schreibungen |  |  |  |  | spelling | 寫法，拼法 |
| Schreiber | der | Schreiber |  |  |  |  | writer, author, scribe, scrivener; clerk | 作家；作者 (男性或未指定性別)；文員；書記 (男性或未指定性別) |
| Schreiben | das | Schreiben |  |  |  |  | writing, letter | 書信、函件 |
| fortschreiben |  |  | schreibt fort · schrieb fort · fortgeschrieben | haben | strong | separable | to update; to uphold |  |
| abschreiben |  |  | schreibt ab · schrieb ab · abgeschrieben | haben | strong | separable | to transcribe, copy; to plagiarize, copy | 抄寫、剽竊、抄襲；扣除、折扣 |
| Abschreibung | die | Abschreibungen |  |  |  |  | writedown, writeoff | 折舊 |
| vorschreiben |  |  | schreibt vor · schrieb vor · vorgeschrieben | haben | strong | separable | to prescribe, to dictate, to command | 寫出，寫給……看，示範地寫，規定 |
| mitschreiben |  |  | schreibt mit · schrieb mit · mitgeschrieben | haben | unknown | separable |  | /vi. 聽寫，記錄，筆錄，邊聽邊記 |
| hinschreiben |  |  | schreibt hin · schrieb hin · hingeschrieben | haben | strong | separable | to write down, to write |  |
| festschreiben |  |  | schreibt fest · schrieb fest · festgeschrieben | haben | strong | separable | to establish, codify, stipulate | 編成法典，立法，核准，批准，認可，釘，樁，確定，明確 |
| einschreiben |  |  | schreibt ein · schrieb ein · eingeschrieben | haben | strong | separable | to write into, inscribe; to send by registered mail | 登記、掛號、註冊、把…寫進 |
| ausschreiben |  |  | schreibt aus · schrieb aus · ausgeschrieben | both | strong | separable | to advertise; to advertise for bids | 做廣告，做宣傳 |
| Ausschreibung | die | Ausschreibungen |  |  |  |  | tender; tendering, bidding | 招聘廣告；招募廣告；通告，公示 |
| anschreiben |  |  | schreibt an · schrieb an · angeschrieben | haben | strong | separable | to write to; to write on/up | 寫上，記下來，記上（所欠的帳），提出書面申請 |
| Anschreiben | das | Anschreiben |  |  |  |  | cover letter |  |

Compounds with schreiben: as modifier [], as head []

## kaufen (family f07002, root kaufen, 25 nodes)

```
kaufen VERB A1 z=5.47
    seg: kauf:ROOT + en:END
  verkaufen VERB A1 z=5.22  <ver- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ver:PREF + kauf:ROOT + en:END
    verkauft ADJ B2 z=4.51  <0 VERB>ADJ  > [dVA13]
        seg: ver:PREF + kauf:ROOT + t:END
    Verkauf NOUN B2 z=4.28  <0 VERB>NOUN stem_noun > [dVN10]
        seg: Ver:PREF + kauf:ROOT
      Vorverkauf NOUN C2 z=3.31  <vor- NOUN>NOUN  > [dNN35.1]
          seg: Vor:PREF + ver:PREF + kauf:ROOT
      Ausverkauf NOUN C2 z=3.26  <aus- NOUN>NOUN  > [dNN31.1]
          seg: Aus:PREF + ver:PREF + kauf:ROOT
      aus|verkaufen VERB beyond z=2.34 (path)  <aus- NOUN>VERB  > [dNV17]
          seg: aus:PREF_SEP + ver:PREF + kauf:ROOT + en:END
        ausverkauft ADJ C1 z=3.98  <0 VERB>ADJ  > [dVA13]
            seg: aus:PREF_SEP + ver:PREF + kauf:ROOT + t:END
    Verkäufer NOUN B2 z=4.19  <-er VERB>NOUN agent_noun umlaut> [dVN03]
        seg: Ver:PREF + käuf:ROOT + er:SUFF
      Verkäuferin NOUN C2 z=3.55  <-in NOUN>NOUN feminine > [dNN02]
          seg: Ver:PREF + käuf:ROOT + er:SUFF + in:SUFF
    weiter|verkaufen VERB C2 z=3.56  <weiter- VERB>VERB prefixed_verb > [stitch:prefix]
        seg: weiter:PREF_SEP + ver:PREF + kauf:ROOT + en:END
  ein|kaufen VERB A2 z=4.83  <ein- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ein:PREF_SEP + kauf:ROOT + en:END
    Einkauf NOUN B2 z=4.18  <0 VERB>NOUN stem_noun > [dVN10]
        seg: Ein:PREF_SEP + kauf:ROOT
    Einkäufer NOUN beyond z=3.13  <-er VERB>NOUN agent_noun umlaut> [dVN03]
        seg: Ein:PREF_SEP + käuf:ROOT + er:SUFF
  Käufer NOUN B2 z=4.22  <-er VERB>NOUN agent_noun umlaut> [dVN03]
      seg: Käuf:ROOT + er:SUFF
  Kauf NOUN C1 z=4.05  <0 VERB>NOUN stem_noun > [dVN10]
      seg: Kauf:ROOT
  ab|kaufen VERB C1 z=3.86  <ab- VERB>VERB prefixed_verb > [dVV26.1]
      seg: ab:PREF_SEP + kauf:ROOT + en:END
  auf|kaufen VERB C1 z=3.78  <auf- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: auf:PREF_SEP + kauf:ROOT + en:END
  an|kaufen VERB C2 z=3.45  <an- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: an:PREF_SEP + kauf:ROOT + en:END
    Ankauf NOUN C2 z=3.66  <0 VERB>NOUN stem_noun > [dVN10]
        seg: An:PREF_SEP + kauf:ROOT
  erkaufen VERB C2 z=3.4  <er- VERB>VERB prefixed_verb > [dVV03.1]
      seg: er:PREF + kauf:ROOT + en:END
  zurück|kaufen VERB C2 z=3.3  <zurück- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: zurück:PREF_SEP + kauf:ROOT + en:END
  nach|kaufen VERB C2 z=3.22  <nach- VERB>VERB prefixed_verb > [dVV33.1]
      seg: nach:PREF_SEP + kauf:ROOT + en:END
  käuflich ADJ C2 z=3.21  <-lich VERB>ADJ relational_adj umlaut> [stitch:wiktionary-etymology]
      seg: käuf:ROOT + lich:SUFF
  zu|kaufen VERB beyond z=3.16  <zu- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: zu:PREF_SEP + kauf:ROOT + en:END
```

| key | article | plural | principal parts | aux | conj | prefix | gloss_en | gloss_zh |
|---|---|---|---|---|---|---|---|---|
| kaufen |  |  | kauft · kaufte · gekauft | haben | weak | none | to buy, to purchase; to buy, to purchase for someone | 買、購買；收買、賄賂 |
| zurückkaufen |  |  | kauft zurück · kaufte zurück · zurückgekauft | haben | weak | separable | to buy back | 買回，回購，重新購買（曾經擁有但後來被賣掉（或被竊、遺失）的物品） |
| verkaufen |  |  | verkauft · verkaufte · verkauft | haben | weak | inseparable | to sell | 出售，賣出（將物品或商品以金錢交換而轉讓）；買錯，買虧（購買了後來證明不合適或太貴的東西） |
| weiterverkaufen |  |  | verkauft weiter · verkaufte weiter · weiterverkauft | haben | weak | separable | to resell | 轉手，轉售，再次銷售（將自己擁有的、先前購買的東西售予他人以換取金錢或類似的東西） |
| verkauft |  |  |  |  |  |  | sold | 售出的，賣的 |
| Verkäufer | der | Verkäufer |  |  |  |  | seller; salesclerk, salesman, shop assistant, sales assistant, vendor |  |
| Verkäuferin | die | Verkäuferinnen |  |  |  |  | seller, vendor | 女營業員 |
| Verkauf | der | Verkäufe |  |  |  |  | sale | 賣、銷售、銷售部、營業部 |
| ausverkaufen |  |  | verkauft aus · verkaufte aus · ausverkauft | haben | weak | separable | to sell out; to sell off | 售完，賣光 |
| ausverkauft |  |  |  |  |  |  |  |  |
| Ausverkauf | der | Ausverkäufe |  |  |  |  | fire sale, clearance sale, liquidation sale |  |
| Vorverkauf | der | Vorverkäufe |  |  |  |  | presale | 預售 |
| käuflich |  |  |  |  |  |  | buyable, for sale, purchasable, available; venal, corrupt, bribable | 可購得的，可買到的，可收買的，可賄賂的 |
| nachkaufen |  |  | kauft nach · kaufte nach · nachgekauft | haben | weak | separable | to buy more; to also buy | 購買更多；也買（別人買過的東西） |
| erkaufen |  |  | erkauft · erkaufte · erkauft | haben | weak | inseparable | to gain something through sacrifice | 買、購 |
| abkaufen |  |  | kauft ab · kaufte ab · abgekauft | haben | weak | separable | to buy, buy out; to buy into, buy | 從……買，買下；買單，相信 |
| Käufer | der | Käufer |  |  |  |  |  | 買主、顧客、買方 |
| Kauf | der | Käufe |  |  |  |  | purchase | 購買、收買 |
| einkaufen |  |  | kauft ein · kaufte ein · eingekauft | haben | weak | separable | to shop; to buy, to purchase |  |
| Einkäufer | der | Einkäufer |  |  |  |  | buyer, purchaser, purchasing agent | - 採購員 |
| Einkauf | der | Einkäufe |  |  |  |  | purchase; whole set of purchased goods | 買進、購買、採購部 |
| aufkaufen |  |  | kauft auf · kaufte auf · aufgekauft | haben | unknown | separable |  | 收購 |
| ankaufen |  |  | kauft an · kaufte an · angekauft | haben | weak | separable | to buy | 購入，買進，購得，購置（尤其是作為投資，大量購買或收藏)；為了居住而獲得某處的房地產 |
| Ankauf | der | Ankäufe |  |  |  |  | purchase | (大量)購入，買進，購買，購置，收購，購得 |
| zukaufen |  |  | kauft zu · kaufte zu · zugekauft | haben | weak | separable | to buy in addition |  |

Compounds with kaufen: as modifier [], as head []

## arbeiten (family f00646, root arbeiten, 39 nodes)

```
arbeiten VERB A1 z=5.72
    seg: arbeit:ROOT + en:END
  Arbeit NOUN A1 z=5.46  <0 VERB>NOUN stem_noun > [dVN10]
      seg: Arbeit:ROOT
    arbeitslos ADJ B2 z=4.18  <-los NOUN>ADJ privative_adj > [dNA29]
        seg: arbeit:ROOT + s:LINK + los:SUFF
      Arbeitslosigkeit NOUN C1 z=4.06  <-keit ADJ>NOUN quality_noun > [dAN04]
          seg: Arbeit:ROOT + s:LINK + los:SUFF + igkeit:SUFF
    Mitarbeit NOUN C1 z=3.93  <mit- NOUN>NOUN  > [dNN34.3]
        seg: Mit:PREF + arbeit:ROOT
    Vorarbeit NOUN C2 z=3.49  <vor- NOUN>NOUN  > [stitch:wiktionary-etymology]
        seg: Vor:PREF + arbeit:ROOT
    arbeitsfähig ADJ beyond z=3.05  <-fähig NOUN>ADJ  > [stitch:wiktionary-etymology]
        seg: arbeit:ROOT + s:LINK + fähig:SUFF
  Arbeiter NOUN B1 z=4.53  <-er VERB>NOUN agent_noun > [dVN03]
      seg: Arbeit:ROOT + er:SUFF
    Arbeiterin NOUN C2 z=3.53  <-in NOUN>NOUN feminine > [dNN02]
        seg: Arbeit:ROOT + er:SUFF + in:SUFF
    Arbeiterschaft NOUN beyond z=3.02  <-schaft NOUN>NOUN collective_noun > [dNN04]
        seg: Arbeit:ROOT + er:SUFF + schaft:SUFF
  bearbeiten VERB B2 z=4.47  <be- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: be:PREF + arbeit:ROOT + en:END
    Bearbeitung NOUN B2 z=4.22  <-ung VERB>NOUN action_noun > [dVN07]
        seg: Be:PREF + arbeit:ROOT + ung:SUFF
  zusammen|arbeiten VERB B2 z=4.28  <zusammen- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: zusammen:PREF_SEP + arbeit:ROOT + en:END
    Zusammenarbeit NOUN A2 z=4.83  <0 VERB>NOUN stem_noun > [reversed:dNV09]
        seg: Zusammen:PREF_SEP + arbeit:ROOT
  erarbeiten VERB B2 z=4.28  <er- VERB>VERB prefixed_verb > [dVV03.1]
      seg: er:PREF + arbeit:ROOT + en:END
  verarbeiten VERB B2 z=4.2  <ver- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ver:PREF + arbeit:ROOT + en:END
    Verarbeitung NOUN C1 z=3.98  <-ung VERB>NOUN action_noun > [dVN07]
        seg: Ver:PREF + arbeit:ROOT + ung:SUFF
    verarbeitet ADJ C1 z=3.81  <0 VERB>ADJ  > [dVA13]
        seg: ver:PREF + arbeit:ROOT + et:END
  aus|arbeiten VERB C1 z=4.04  <aus- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: aus:PREF_SEP + arbeit:ROOT + en:END
    Ausarbeitung NOUN C2 z=3.5  <-ung VERB>NOUN action_noun > [dVN07]
        seg: Aus:PREF_SEP + arbeit:ROOT + ung:SUFF
  ein|arbeiten VERB C1 z=4.03  <ein- VERB>VERB prefixed_verb > [dVV22.1]
      seg: ein:PREF_SEP + arbeit:ROOT + en:END
  ab|arbeiten VERB C1 z=4.0  <ab- VERB>VERB prefixed_verb > [dVV26.1]
      seg: ab:PREF_SEP + arbeit:ROOT + en:END
  mit|arbeiten VERB C1 z=4.0  <mit- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: mit:PREF_SEP + arbeit:ROOT + en:END
    Mitarbeiter NOUN A1 z=5.14  <-er VERB>NOUN agent_noun > [dVN03]
        seg: Mit:PREF_SEP + arbeit:ROOT + er:SUFF
      Mitarbeiterin NOUN B2 z=4.13  <-in NOUN>NOUN feminine > [dNN02]
          seg: Mit:PREF_SEP + arbeit:ROOT + er:SUFF + in:SUFF
  auf|arbeiten VERB C1 z=3.93  <auf- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: auf:PREF_SEP + arbeit:ROOT + en:END
    Aufarbeitung NOUN C1 z=3.78  <-ung VERB>NOUN action_noun > [dVN07]
        seg: Auf:PREF_SEP + arbeit:ROOT + ung:SUFF
  überarbeiten VERB C1 z=3.8  <über- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: über:PREF + arbeit:ROOT + en:END
    überarbeitet ADJ C1 z=3.86  <0 VERB>ADJ  > [dVA13]
        seg: über:PREF + arbeit:ROOT + et:END
    Überarbeitung NOUN C2 z=3.53  <-ung VERB>NOUN action_noun > [dVN07]
        seg: Über:PREF + arbeit:ROOT + ung:SUFF
  heraus|arbeiten VERB C1 z=3.75  <heraus- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: heraus:PREF_SEP + arbeit:ROOT + en:END
  weiter|arbeiten VERB C1 z=3.72  <weiter- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: weiter:PREF_SEP + arbeit:ROOT + en:END
  durch|arbeiten VERB C2 z=3.61  <durch- VERB>VERB prefixed_verb > [dVV31.1]
      seg: durch:PREF_SEP + arbeit:ROOT + en:END
  hin|arbeiten VERB C2 z=3.58  <hin- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: hin:PREF_SEP + arbeit:ROOT + en:END
  arbeitend ADJ C2 z=3.52  <0 VERB>ADJ  > [dVA02]
      seg: arbeit:ROOT + end:END
  vor|arbeiten VERB C2 z=3.5  <vor- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: vor:PREF_SEP + arbeit:ROOT + en:END
    Vorarbeiter NOUN beyond z=3.01  <-er VERB>NOUN agent_noun > [dVN03]
        seg: Vor:PREF_SEP + arbeit:ROOT + er:SUFF
  nach|arbeiten VERB beyond z=3.14  <nach- VERB>VERB prefixed_verb > [dVV33.1]
      seg: nach:PREF_SEP + arbeit:ROOT + en:END
  um|arbeiten VERB beyond z=3.02  <um- VERB>VERB prefixed_verb > [dVV30.1]
      seg: um:PREF_SEP + arbeit:ROOT + en:END
```

| key | article | plural | principal parts | aux | conj | prefix | gloss_en | gloss_zh |
|---|---|---|---|---|---|---|---|---|
| arbeiten |  |  | arbeitet · arbeitete · gearbeitet | haben | weak | none | to work; to work, function, run, operate | （人）工作、勞動、做工、做事；（機器）工作、運轉 |
| überarbeiten |  |  | überarbeitet · überarbeitete · überarbeitet | haben | weak | inseparable | to edit something in order to improve it; to edit something that it is nearly c… | 修改，改善，提高；工作過度 |
| überarbeitet |  |  |  |  |  |  | edited; over-stressed | ①修改的，②工作過度的，過勞的 |
| Überarbeitung | die | Überarbeitungen |  |  |  |  | revision | 修訂，修改，重做，工作過度 |
| vorarbeiten |  |  | arbeitet vor · arbeitete vor · vorgearbeitet | haben | unknown | separable |  | 提前準備 |
| Vorarbeiter | der | Vorarbeiter |  |  |  |  | foreman | (工廠)班長，領班，工頭，監工 女 Vorarbeiterin |
| verarbeiten |  |  | verarbeitet · verarbeitete · verarbeitet | haben | weak | inseparable | to process, to handle, to manufacture | 加工，製作，處理；領悟，領會 |
| verarbeitet |  |  |  |  |  |  | processed | 經過處理、加工的 |
| Verarbeitung | die | Verarbeitungen |  |  |  |  | processing; workmanship, craftmanship | 加工，處理，使用，執行，執行，工作，消化，吸收，克服，戰勝，完成，手藝 |
| mitarbeiten |  |  | arbeitet mit · arbeitete mit · mitgearbeitet | haben | weak | separable | to collaborate, cooperate | 合作、共事；積極參與（課堂、研討會等） |
| Mitarbeiter | der | Mitarbeiter |  |  |  |  | employee; collaborator | 同事、僱員、工人 |
| Mitarbeiterin | die | Mitarbeiterinnen |  |  |  |  | associate, employee, colleague |  |
| hinarbeiten |  |  | arbeitet hin · arbeitete hin · hingearbeitet | haben | weak | separable | to work towards | （朝著某個目的）努力 [接 auf (+ 賓格)] |
| bearbeiten |  |  | bearbeitet · bearbeitete · bearbeitet | haben | weak | inseparable | to edit; to work on something | 編輯、執行、處理、執行 |
| Bearbeitung | die | Bearbeitungen |  |  |  |  | edit; processing | 編輯 |
| aufarbeiten |  |  | arbeitet auf · arbeitete auf · aufgearbeitet | haben | weak | separable | to refurbish; to use up | 修理、重建、翻新、更新 |
| Aufarbeitung | die | Aufarbeitungen |  |  |  |  | reprocessing; renovation, reconditioning | 處理；翻新；修復 |
| umarbeiten |  |  | arbeitet um · arbeitete um · umgearbeitet | haben | weak | separable | to rework, revamp; to revise | 修改、改進 |
| nacharbeiten |  |  | arbeitet nach · arbeitete nach · nachgearbeitet | haben | weak | separable | to rework, to touch up; to rectify | 核查、複習、複核、重複 |
| erarbeiten |  |  | erarbeitet · erarbeitete · erarbeitet | haben | weak | inseparable | to work something out; to obtain by hard work | 擬就。制訂出。詳細計劃 |
| einarbeiten |  |  | arbeitet ein · arbeitete ein · eingearbeitet | haben | weak | separable | to incorporate; to train for a new job | 漸漸熟悉。訓練。帶……入門。包括。包含。進入。混入。插入。添入。新增。加入。加進 |
| durcharbeiten |  |  | arbeitet durch · arbeitete durch · durchgearbeitet | haben | weak | separable | to work throughout | 仔細研究。鑽研；持續地工作。不停頓地工作 |
| arbeitend |  |  |  |  |  |  | working |  |
| abarbeiten |  |  | arbeitet ab · arbeitete ab · abgearbeitet | haben | weak | separable | to work off; to resolve or take care of something by working; to work hard, to… | 工作償還 （債務），通過幹活補償（犯的罪等）；做完 （待辦任務，作業等） |
| Arbeiter | der | Arbeiter |  |  |  |  |  | 工人，員工，僱員 |
| Arbeiterschaft | die |  |  |  |  |  |  | 勞動力，工薪族，無產階級，工人階級 |
| Arbeiterin | die | Arbeiterinnen |  |  |  |  | female laborer, worker; worker bee |  |
| Arbeit | die | Arbeiten |  |  |  |  | toil, regularly performed work, regularly pursued economic activity, labor, job… | 工作；職業；任務 |
| arbeitsfähig |  |  |  |  |  |  | able to work | 有勞動能力的，能夠工作的 |
| arbeitslos |  |  |  |  |  |  | unemployed; on welfare; unemployed; idle | 失業的，沒有工作的；靠申領政府救濟過活的 |
| Arbeitslosigkeit | die |  |  |  |  |  | unemployment, joblessness, worklessness | 失業 |
| Mitarbeit | die |  |  |  |  |  | cooperation, collaboration; assistance |  |
| Vorarbeit | die | Vorarbeiten |  |  |  |  | preparatory work | 準備工作 |
| zusammenarbeiten |  |  | arbeitet zusammen · arbeitete zusammen · zusammengearbeitet | haben | weak | separable | to work together, to cooperate | 合作，協作 |
| Zusammenarbeit | die | Zusammenarbeiten |  |  |  |  | collaboration, cooperation, teamwork | 合作、團隊合作 |
| weiterarbeiten |  |  | arbeitet weiter · arbeitete weiter · weitergearbeitet | haben | weak | separable | to resume one's work | 繼續工作，繼續做事；努力沿著一條道路前進（如在人生的道路上） |
| herausarbeiten |  |  | arbeitet heraus · arbeitete heraus · herausgearbeitet | haben | unknown | separable |  | 雕出。塑造出。使突出。強調。使明確。[口]預作。補做(工作時間)。vr.(努力)解脫出來。擺脫開。熬出來。掙扎出來 |
| ausarbeiten |  |  | arbeitet aus · arbeitete aus · ausgearbeitet | haben | weak | separable | to flesh out, to elaborate, to work out | 制定、擬定、起草、修改；加工 |
| Ausarbeitung | die | Ausarbeitungen |  |  |  |  |  | 精心製作，起草，擬好的檔案，動態，發展 |

Compounds with arbeiten: as modifier ['Arbeitender'], as head ['Bauarbeiten']

## Freund (family f04413, root froh, 19 nodes)

```
froh ADJ A2 z=4.88
    seg: froh:ROOT
  freuen VERB A1 z=5.33  <0 ADJ>VERB  > [stitch:wiktionary-etymology]
      seg: freu:ROOT + en:END
    freund ADJ B1 z=4.59  <0 VERB>ADJ  > [dVA12]
        seg: freu:ROOT + nd:END
      freunden VERB beyond z=4.71 (path)  <0 ADJ>VERB  > [dAV04]
          seg: freund:ROOT + en:END
        Freund NOUN A1 z=5.42  <0 VERB>NOUN stem_noun > [dVN10]
            seg: Freund:ROOT
          Freundin NOUN A2 z=4.9  <-in NOUN>NOUN feminine > [dNN02]
              seg: Freund:ROOT + in:SUFF
        freundlich ADJ B1 z=4.72  <-lich VERB>ADJ relational_adj > [dVA11]
            seg: freund:ROOT + lich:SUFF
          Freundlichkeit NOUN C2 z=3.6  <-keit ADJ>NOUN quality_noun > [dAN03]
              seg: Freund:ROOT + lich:SUFF + keit:SUFF
          unfreundlich ADJ C2 z=3.59  <un- ADJ>ADJ  > [dAA02]
              seg: un:PREF + freund:ROOT + lich:SUFF
        Freundschaft NOUN B2 z=4.3  <-schaft VERB>NOUN collective_noun > [dVN11]
            seg: Freund:ROOT + schaft:SUFF
          freundschaftlich ADJ C1 z=3.68  <-lich NOUN>ADJ relational_adj > [dNA27]
              seg: freund:ROOT + schaft:SUFF + lich:SUFF
        an|freunden VERB C1 z=3.9  <an- VERB>VERB prefixed_verb > [dVV13.1]
            seg: an:PREF_SEP + freund:ROOT + en:END
        befreunden VERB beyond z=2.59 (path)  <be- VERB>VERB prefixed_verb > [dVV02.1]
            seg: be:PREF + freund:ROOT + en:END
          befreundet ADJ C1 z=4.11  <0 VERB>ADJ  > [dVA13]
              seg: be:PREF + freund:ROOT + et:END
    erfreuen VERB B2 z=4.15  <er- VERB>VERB prefixed_verb > [stitch:prefix]
        seg: er:PREF + freu:ROOT + en:END
      erfreulich ADJ C1 z=3.95  <-lich VERB>ADJ relational_adj > [dVA11]
          seg: er:PREF + freu:ROOT + lich:SUFF
        unerfreulich ADJ beyond z=3.1  <un- ADJ>ADJ  > [dAA02]
            seg: un:PREF + er:PREF + freu:ROOT + lich:SUFF
        erfreulicherweise ADV beyond z=3.03  <-erweise ADJ>ADV  > [stitch:wiktionary-etymology]
            seg: erfreulich:ROOT + erweise:SUFF
      erfreut ADJ C1 z=3.94  <0 VERB>ADJ  > [dVA13]
          seg: er:PREF + freu:ROOT + t:END
```

| key | article | plural | principal parts | aux | conj | prefix | gloss_en | gloss_zh |
|---|---|---|---|---|---|---|---|---|
| froh |  |  |  |  |  |  | glad; happy; cheerful; merry |  |
| freuen |  |  | freut · freute · gefreut | haben | weak | none | to gladden, to make glad, to make pleased; to be glad, pleased, or happy about… | 使...開心，使...高興；高興 |
| freund |  |  |  |  |  |  |  |  |
| freunden |  |  |  | unknown | unknown | none |  |  |
| anfreunden |  |  | freundet an · freundete an · angefreundet | haben | weak | separable | to make friends, to befriend; to get used | 結交，交友，(與mit連用)習慣於 |
| freundlich |  |  |  |  |  |  | friendly, benign; nice, pleasant | 友善的，友好的，親切的 |
| unfreundlich |  |  |  |  |  |  | unfriendly | ①不友好的，不客氣的，敵意的，不禮貌的，②心情不好的，情緒惡劣的，不愉快的，③（天氣）陰冷的 |
| Freundlichkeit | die | Freundlichkeiten |  |  |  |  | kindness, friendliness; kindness | 親切、友好 |
| Freund | der | Freunde |  |  |  |  | friend; boyfriend | 朋友；男朋友 |
| Freundin | die | Freundinnen |  |  |  |  |  |  |
| befreunden |  |  | befreundet · befreundete · befreundet | haben | weak | inseparable | to befriend, to become friends with, to make friends with | vr. 結交，熟悉，習慣 |
| befreundet |  |  |  |  |  |  | friendly, friends | 友好的，親切的，合得來的 |
| Freundschaft | die | Freundschaften |  |  |  |  | friendship; relations, relatives | 誼、友誼、交誼、交情、友好、親善關係 |
| freundschaftlich |  |  |  |  |  |  | friendly, amicable | adv. 友好的，友誼的，親切的 |
| erfreuen |  |  | erfreut · erfreute · erfreut | haben | weak | inseparable | to please; to make happy; to enjoy; to delight in | 使高興，取悅；享有；因有……而感到愉快 [接 屬格或an (+ 與格) 「某事物」] |
| erfreut |  |  |  |  |  |  |  |  |
| erfreulich |  |  |  |  |  |  | pleasant, pleasing | 令人高興的，令人愉快的 |
| erfreulicherweise |  |  |  |  |  |  | happily | 幸運地 |
| unerfreulich |  |  |  |  |  |  | unpleasant, unpleasing |  |

Compounds with Freund: as modifier ['Freundeskreis'], as head ['Naturfreund', 'Parteifreund', 'Schulfreund']

## geben (family f04632, root geben, 45 nodes)

```
geben VERB A1 z=6.34
    seg: geb:ROOT + en:END
  auf|geben VERB A1 z=5.14  <auf- VERB>VERB prefixed_verb > [dVV14.1]
      seg: auf:PREF_SEP + geb:ROOT + en:END
  ab|geben VERB A1 z=5.13  <ab- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ab:PREF_SEP + geb:ROOT + en:END
    Abgabe NOUN C1 z=4.06  <0 VERB>NOUN stem_noun ablaut> [dVN08]
        seg: Ab:PREF_SEP + gabe:ROOT
  an|geben VERB A1 z=5.1  <an- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: an:PREF_SEP + geb:ROOT + en:END
    angeblich ADJ B1 z=4.63  <-lich VERB>ADJ relational_adj > [dVA11]
        seg: an:PREF_SEP + geb:ROOT + lich:SUFF
    angeblich ADV B2 z=4.23  <-lich VERB>ADV  > [stitch:wiktionary-etymology]
        seg: angeb:ROOT + lich:SUFF
  aus|geben VERB A2 z=5.03  <aus- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: aus:PREF_SEP + geb:ROOT + en:END
  ergeben VERB A2 z=4.97  <er- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: er:PREF + geb:ROOT + en:END
    Ergebnis NOUN A1 z=5.28  <-nis VERB>NOUN result_noun > [stitch:wiktionary-etymology]
        seg: Er:PREF + geb:ROOT + nis:SUFF
      ergebnislos ADJ beyond z=3.07  <-los NOUN>ADJ privative_adj > [dNA29]
          seg: er:PREF + geb:ROOT + nis:SUFF + los:SUFF
  über|geben VERB A2 z=4.93  <über- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: über:PREF_SEP + geb:ROOT + en:END
    Übergabe NOUN C1 z=3.9  <0 VERB>NOUN stem_noun ablaut> [dVN08]
        seg: Über:PREF_SEP + gabe:ROOT
  zu|geben VERB A2 z=4.82  <zu- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: zu:PREF_SEP + geb:ROOT + en:END
    Zugabe NOUN C2 z=3.33  <0 VERB>NOUN stem_noun ablaut> [dVN08]
        seg: Zu:PREF_SEP + gabe:ROOT
  Geben NOUN A2 z=4.82  <0 VERB>NOUN nominalized_infinitive > [dVN09]
      seg: Geb:ROOT + en:END
  um|geben VERB B1 z=4.69  <um- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: um:PREF_SEP + geb:ROOT + en:END
    Umgebung NOUN B1 z=4.79  <-ung VERB>NOUN action_noun > [dVN07]
        seg: Um:PREF_SEP + geb:ROOT + ung:SUFF
    umgebend ADJ C2 z=3.63  <0 VERB>ADJ  > [dVA02]
        seg: um:PREF_SEP + geb:ROOT + end:END
  vor|geben VERB B1 z=4.69  <vor- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: vor:PREF_SEP + geb:ROOT + en:END
    Vorgabe NOUN C1 z=3.89  <0 VERB>NOUN stem_noun ablaut> [dVN08]
        seg: Vor:PREF_SEP + gabe:ROOT
  zurück|geben VERB B2 z=4.48  <zurück- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: zurück:PREF_SEP + geb:ROOT + en:END
  weiter|geben VERB B2 z=4.46  <weiter- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: weiter:PREF_SEP + geb:ROOT + en:END
    Weitergabe NOUN C2 z=3.44  <0 VERB>NOUN stem_noun ablaut> [dVN08]
        seg: Weiter:PREF_SEP + gabe:ROOT
  vergeben VERB B2 z=4.44  <ver- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ver:PREF + geb:ROOT + en:END
    vergeblich ADJ C1 z=4.03  <-lich VERB>ADJ relational_adj > [dVA11]
        seg: ver:PREF + geb:ROOT + lich:SUFF
    Vergabe NOUN C1 z=3.79  <0 VERB>NOUN stem_noun ablaut> [dVN08]
        seg: Ver:PREF + gabe:ROOT
    Vergebung NOUN C2 z=3.53  <-ung VERB>NOUN action_noun > [dVN07]
        seg: Ver:PREF + geb:ROOT + ung:SUFF
  begeben VERB B2 z=4.37  <be- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: be:PREF + geb:ROOT + en:END
    Begebenheit NOUN C2 z=3.53  <0 VERB>NOUN  > [stitch:wiktionary-etymology]
        seg: Begebenheit:ROOT
  ein|geben VERB B2 z=4.37  <ein- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ein:PREF_SEP + geb:ROOT + en:END
    Eingabe NOUN C1 z=3.68  <0 VERB>NOUN stem_noun ablaut> [dVN08]
        seg: Ein:PREF_SEP + gabe:ROOT
  wieder|geben VERB B2 z=4.3  <wieder- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: wieder:PREF_SEP + geb:ROOT + en:END
    Wiedergabe NOUN C2 z=3.61  <0 VERB>NOUN stem_noun ablaut> [dVN08]
        seg: Wieder:PREF_SEP + gabe:ROOT
  heraus|geben VERB B2 z=4.25  <heraus- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: heraus:PREF_SEP + geb:ROOT + en:END
    Herausgeber NOUN C1 z=4.07  <-er VERB>NOUN agent_noun > [dVN03]
        seg: Heraus:PREF_SEP + geb:ROOT + er:SUFF
    Herausgabe NOUN C2 z=3.66  <0 VERB>NOUN stem_noun ablaut> [dVN08]
        seg: Heraus:PREF_SEP + gabe:ROOT
  nach|geben VERB B2 z=4.14  <nach- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: nach:PREF_SEP + geb:ROOT + en:END
  her|geben VERB C1 z=4.07  <her- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: her:PREF_SEP + geb:ROOT + en:END
  hin|geben VERB C1 z=3.98  <hin- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: hin:PREF_SEP + geb:ROOT + en:END
    Hingabe NOUN C2 z=3.61  <0 VERB>NOUN stem_noun ablaut> [dVN08]
        seg: Hin:PREF_SEP + gabe:ROOT
  mit|geben VERB C1 z=3.86  <mit- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: mit:PREF_SEP + geb:ROOT + en:END
  bei|geben VERB C2 z=3.43  <bei- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: bei:PREF_SEP + geb:ROOT + en:END
  weg|geben VERB C2 z=3.3  <weg- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: weg:PREF_SEP + geb:ROOT + en:END
  durch|geben VERB beyond z=3.17  <durch- VERB>VERB prefixed_verb > [dVV31.1]
      seg: durch:PREF_SEP + geb:ROOT + en:END
```

| key | article | plural | principal parts | aux | conj | prefix | gloss_en | gloss_zh |
|---|---|---|---|---|---|---|---|---|
| geben |  |  | gibt · gab · gegeben | haben | strong | none | to give; to hand, to pass, to put within reach | 給，給予（改變所有權） [接 與格 「某人」 和 賓格 「某物」]；遞，傳遞，放在觸手可及處 [接 與格 「某人」 和 賓格 「某物」] |
| übergeben |  |  | übergibt · übergab · übergeben | haben | strong | separable | to hand over; to vomit, to throw up | 遞交、交出、讓出、投降；引渡 |
| Übergabe | die | Übergaben |  |  |  |  | handover, handoff, transfer, delivery; surrender, capitulation | 遞交，上交，轉交，交出，交出，交貨，交割，轉讓，遞送，交付，投交 |
| wiedergeben |  |  | gibt wieder · gab wieder · wiedergegeben | haben | strong | separable | to give back, to return; to render, to echo, to reproduce | 歸還，把……還給（其合法或先前的所有者）；複述，再現（陳述或呈現某個來源或對話的內容） |
| Wiedergabe | die | Wiedergaben |  |  |  |  | rendition; render | 複述，翻譯，歸還，複製品 |
| weggeben |  |  | gibt weg · gab weg · weggegeben | haben | strong | separable | to give away | 贈送，分發 |
| vorgeben |  |  | gibt vor · gab vor · vorgegeben | haben | strong | separable | to pretend; to purport, to allege, to profess, to claim | 假裝，偽裝，偽稱；聲稱，宣稱 |
| Vorgabe | die | Vorgaben |  |  |  |  | specification, guideline, provision; setting, default | 阻礙，困難，指導路線，方針，預設值 |
| vergeben |  |  | vergibt · vergab · vergeben | haben | strong | inseparable | to forgive; to assign; to allocate; to give; to give or set; to award, to give… | 原諒；分配，派發 （任務，工作等） [接 an (+ 賓格)] |
| vergeblich |  |  |  |  |  |  | unavailing, in vain, futile, useless | 徒勞的，徒然的 |
| Vergebung | die | Vergebungen |  |  |  |  | pardon, forgiveness; remission | 饒恕，赦免，免罪，原諒 |
| Vergabe | die | Vergaben |  |  |  |  | awarding, allocation | 分配，分派，發錯牌 |
| umgeben |  |  | gibt um · gab um · umgegeben | haben | strong | separable | to surround | 圍繞、環繞 |
| umgebend |  |  |  |  |  |  | surrounding; ambient | 周圍的，附近的 |
| Umgebung | die | Umgebungen |  |  |  |  | environment, vicinity, surroundings | 四周，周圍，環境 |
| mitgeben |  |  | gibt mit · gab mit · mitgegeben | haben | strong | separable | to give someone something to take along; to teach someone something, especially… | 給...讓其帶著；教授，傳授 |
| hingeben |  |  | gibt hin · gab hin · hingegeben | haben | strong | separable | to hand over; to sacrifice | ==== 詞源 ==== hin- + geben ==== 動詞 ====vt. 交出，獻給，送出，交付，vr. 獻身於，沉迷於，獻身於，委身於 |
| Hingabe | die |  |  |  |  |  | devotion; dedication, commitment | 奉獻，獻身，忠心，熱忱；投入，專心 |
| hergeben |  |  | gibt her · gab her · hergegeben | haben | strong | separable | to hand over; to provide | 獻出，提供，給回 |
| herausgeben |  |  | gibt heraus · gab heraus · herausgegeben | haben | strong | separable | to give/take/put something out of something; to hand over, to give, to restitut… | (從裡往外)拿出，遞出，交還，退還，找零錢，發行，出版 |
| Herausgeber | der | Herausgeber |  |  |  |  | editor; publisher | 編者；出版人，發行人（男性或未知性別）；出版社，出版公司 |
| Herausgabe | die | Herausgaben |  |  |  |  | issuing, publication; restitution, disclosure, handing over | 歸還，償還，交出，交還，交付 |
| durchgeben |  |  | gibt durch · gab durch · durchgegeben | haben | strong | separable | to pass something through an opening; to transmit, to pass through, to give |  |
| aufgeben |  |  | gibt auf · gab auf · aufgegeben | haben | strong | separable | to give up on; to give up | 拋棄、放棄、遺棄；上交 |
| Geben | das |  |  |  |  |  |  |  |
| ergeben |  |  | ergibt · ergab · ergeben | haben | strong | inseparable | to yield, produce; to make sense | 產出，產生；投降 |
| Ergebnis | das | Ergebnisse |  |  |  |  | result, outcome, conclusion, finding, fruit, consequence, upshot, answer; earni… | 結果，後果；盈利，產出 |
| ergebnislos |  |  |  |  |  |  | unsuccessful, fruitless; inconclusive, indecisive | adv. 無結果的，徒勞的 |
| eingeben |  |  | gibt ein · gab ein · eingegeben | haben | strong | separable | to enter, input; to type | 給，進入，放入，讀入，飼養，餵養，滋養，輸入，注入（藥） |
| Eingabe | die | Eingaben |  |  |  |  | input, entry, keying, submission, entering; petition, application | 輸入，申報，申請書 |
| beigeben |  |  | gibt bei · gab bei · beigegeben | haben | strong | separable | to add; to admit defeat; give in | 新增 （常用於烹飪配方中） |
| angeben |  |  | gibt an · gab an · angegeben | haben | strong | separable | to state, supply, give, report; to show, represent | 說明，詳述，指出，指定；說出；洩露，出賣；炫耀，自誇，吹牛 |
| angeblich#adv |  |  |  |  |  |  | allegedly, supposedly, reportedly, reputedly | 據稱，好像，聽說 |
| angeblich |  |  |  |  |  |  | alleged, pretended, reported | 所謂的，據稱的，號稱的 |
| zurückgeben |  |  | gibt zurück · gab zurück · zurückgegeben | haben | strong | separable | to give back, return | 歸還，交還，返還，找給（零錢） |
| zugeben |  |  | gibt zu · gab zu · zugegeben | haben | strong | separable | to admit, confess; to add | 新增，追加；承認 |
| Zugabe | die | Zugaben |  |  |  |  | addition; bonus, add-on, extra |  |
| weitergeben |  |  | gibt weiter · gab weiter · weitergegeben | haben | strong | separable | to impart; to pass on, to share | 轉交，傳達 |
| Weitergabe | die | Weitergaben |  |  |  |  | transfer; passing on | 轉發，轉播，中繼 |
| nachgeben |  |  | gibt nach · gab nach · nachgegeben | haben | strong | separable | to give way; to give in | （受不了壓力而）；（在之後）多給，額外給 |
| begeben |  |  | begibt · begab · begeben | haben | strong | inseparable | to go; to make one's way; to repair; to happen | 前往；發生 |
| Begebenheit | die | Begebenheiten |  |  |  |  | incident, event, occurrence | 事件，遭遇，發生的事情 |
| ausgeben |  |  | gibt aus · gab aus · ausgegeben | haben | strong | separable | to spend, to expend; to pay out; to dispense | 花費，消耗；分發，分配 |
| abgeben |  |  | gibt ab · gab ab · abgegeben | haben | strong | separable | to give up, relinquish, let go, concede, hand over, etc.; to give away, give out | 給、給出、傳送、送出、提交、傳達；（sich abgeben）參與、花費精力（做某事） |
| Abgabe | die | Abgaben |  |  |  |  | levy, tax, duty; delivery, delivering | 費用，稅費；配送，交付 [接 an (+ 賓格)] |

Compounds with geben: as modifier [], as head []

## lesen (family f08147, root lesen, 21 nodes)

```
lesen VERB A1 z=5.44
    seg: les:ROOT + en:END
  Lesen NOUN A2 z=4.82  <0 VERB>NOUN nominalized_infinitive > [dVN09]
      seg: Les:ROOT + en:END
  Leser NOUN B1 z=4.61  <-er VERB>NOUN agent_noun > [dVN03]
      seg: Les:ROOT + er:SUFF
    Leserin NOUN C2 z=3.58  <-in NOUN>NOUN feminine > [dNN02]
        seg: Les:ROOT + er:SUFF + in:SUFF
    Leserschaft NOUN C2 z=3.22  <-schaft NOUN>NOUN collective_noun > [dNN04]
        seg: Les:ROOT + er:SUFF + schaft:SUFF
  nach|lesen VERB B2 z=4.42  <nach- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: nach:PREF_SEP + les:ROOT + en:END
  vor|lesen VERB B2 z=4.41  <vor- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: vor:PREF_SEP + les:ROOT + en:END
    Vorlesung NOUN B2 z=4.18  <-ung VERB>NOUN action_noun > [dVN07]
        seg: Vor:PREF_SEP + les:ROOT + ung:SUFF
  ab|lesen VERB B2 z=4.19  <ab- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ab:PREF_SEP + les:ROOT + en:END
  Lese NOUN B2 z=4.13  <0 VERB>NOUN stem_noun ablaut> [stitch:conversion]
      seg: Lese:ROOT
  durch|lesen VERB B2 z=4.13  <durch- VERB>VERB prefixed_verb > [dVV31.1]
      seg: durch:PREF_SEP + les:ROOT + en:END
  Lesung NOUN C1 z=4.04  <-ung VERB>NOUN action_noun > [dVN07]
      seg: Les:ROOT + ung:SUFF
  aus|lesen VERB C1 z=3.85  <aus- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: aus:PREF_SEP + les:ROOT + en:END
  weiter|lesen VERB C1 z=3.72  <weiter- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: weiter:PREF_SEP + les:ROOT + en:END
  verlesen VERB C2 z=3.65  <ver- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ver:PREF + les:ROOT + en:END
  mit|lesen VERB C2 z=3.61  <mit- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: mit:PREF_SEP + les:ROOT + en:END
  lesbar ADJ C2 z=3.59  <-bar VERB>ADJ ability_adj > [dVA01]
      seg: les:ROOT + bar:SUFF
    Lesbarkeit NOUN beyond z=3.03  <-keit ADJ>NOUN quality_noun > [dAN03]
        seg: Les:ROOT + bar:SUFF + keit:SUFF
  lesenswert ADJ C2 z=3.54  <0 VERB>ADJ  > [stitch:wiktionary-etymology]
      seg: lesenswert:ROOT
  ein|lesen VERB C2 z=3.53  <ein- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: ein:PREF_SEP + les:ROOT + en:END
  auf|lesen VERB C2 z=3.28  <auf- VERB>VERB prefixed_verb > [stitch:prefix]
      seg: auf:PREF_SEP + les:ROOT + en:END
```

| key | article | plural | principal parts | aux | conj | prefix | gloss_en | gloss_zh |
|---|---|---|---|---|---|---|---|---|
| lesen |  |  | liest · las · gelesen | haben | strong | none | to read; to select and gather or harvest |  |
| lesenswert |  |  |  |  |  |  | readable; worth reading | 值得一讀的 |
| vorlesen |  |  | liest vor · las vor · vorgelesen | haben | strong | separable | to read | 朗讀、朗誦 |
| Vorlesung | die | Vorlesungen |  |  |  |  | lecture | 講座，講課 |
| lesbar |  |  |  |  |  |  | legible; readable | 清楚的（字跡等）；簡單明瞭的，易懂的（文體等） |
| Lesbarkeit | die |  |  |  |  |  | readability; legibility | 易讀性，讀得津津有味，可讀性 |
| durchlesen |  |  | liest durch · las durch · durchgelesen | haben | strong | separable | to read through; to peruse | 通讀；細讀 |
| Lesung | die | Lesungen |  |  |  |  | reading; reading, lection, lesson |  |
| Leser | der | Leser |  |  |  |  |  | 讀者 |
| Leserschaft | die | Leserschaften |  |  |  |  | readership |  |
| Leserin | die | Leserinnen |  |  |  |  | female reader | 女性讀者 |
| Lesen | das |  |  |  |  |  |  |  |
| auslesen |  |  | liest aus · las aus · ausgelesen | haben | strong | separable | to cull; to read, to read out | 選擇，選取，讀出（資料），看完（書） |
| auflesen |  |  | liest auf · las auf · aufgelesen | haben | strong | separable |  | 編排，收集 |
| ablesen |  |  | liest ab · las ab · abgelesen | haben | strong | separable | to read; to pick off, pluck | vt ①照著念 ②看...上的讀數 ③撿，拾 ④看出 |
| weiterlesen |  |  | liest weiter · las weiter · weitergelesen | haben | unknown | separable |  |  |
| verlesen |  |  | verliest · verlas · verlesen | haben | strong | inseparable | to misread; to read out | 朗讀，宣讀，挑揀，擇菜，vr.讀錯 |
| nachlesen |  |  | liest nach · las nach · nachgelesen | haben | strong | separable | to look up; to proofread | 收集，積累，點滴收集 |
| mitlesen |  |  | liest mit · las mit · mitgelesen | haben | unknown | separable |  |  |
| Lese | die | Lesen |  |  |  |  | harvest, picking | （葡萄）收穫，採摘，選集 |
| einlesen |  |  | liest ein · las ein · eingelesen | haben | strong | separable | to acquaint oneself with a work or field by reading; to scan; to read in or dig… | 讀入（資料），讀入（檔案），掃入 |

Compounds with lesen: as modifier [], as head []

