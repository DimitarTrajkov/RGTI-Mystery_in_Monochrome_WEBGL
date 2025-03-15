## 1 Uvod

### Začetni odstavek

V tem projektu razvijamo sistem glasovnega upravljanja ogrevalnega sistema, ki temelji na Kronoterm toplotni črpalki, pri čemer uporabljamo Apple Siri in Home Assistant. Cilj projekta je omogočiti uporabnikom preprosto in intuitivno interakcijo s toplotno črpalko prek glasovnih ukazov, kar bo izboljšalo uporabniško izkušnjo in avtomatizacijo domačega okolja.

Motivacija za ta projekt izhaja iz naraščajoče priljubljenosti pametnih domov in avtomatiziranih rešitev za nadzor nad gospodinjskimi napravami. Čeprav že obstajajo rešitve za glasovno upravljanje različnih pametnih naprav, je integracija toplotnih črpalk še vedno omejena. Z našim projektom želimo zapolniti to vrzel in ponuditi rešitev, ki bo enostavna za uporabo in dostopna širši publiki.

Naš pristop je izviren, saj v Sloveniji trenutno ni široko dostopne rešitve, ki bi omogočala neposredno povezavo Kronoterm toplotne črpalke s Siri in Home Assistant. S tem projektom ne razvijamo le nove funkcionalnosti, temveč tudi omogočamo boljšo integracijo obstoječih tehnologij za pametne domove.

### 1.1 Izzivi

Glavni izzivi pri razvoju tega sistema vključujejo:

- **Integracija glasovnega asistenta:** Povezava med Apple Siri in Home Assistant ter zagotavljanje pravilnega razumevanja in interpretacije glasovnih ukazov.
- **Določitev strukturiranih ukazov:** Oblikovanje natančnih in intuitivnih glasovnih ukazov za nadzor nad funkcijami toplotne črpalke.
- **Razvoj ključnih funkcij:** Implementacija funkcionalnosti, kot so upravljanje temperature, sanitarne vode, prezračevanja ter programov in načinov delovanja.
- **Preverjanje povratnih informacij:** Zagotavljanje zanesljive povratne informacije uporabniku o izvedenih ukazih in trenutnem stanju sistema.
- **Testiranje in optimizacija:** Zagotavljanje stabilnosti in zanesljivosti sistema v realnih uporabniških scenarijih.

Ekipa razvijalcev se prvič srečuje z integracijo Home Assistant in Apple Siri, kar pomeni, da bo potrebna poglobljena raziskava in eksperimentiranje z razpoložljivimi API-ji in možnostmi povezovanja. Vendar pa to prinaša tudi priložnost za pridobivanje novih znanj in veščin, ki bodo uporabne pri prihodnjih projektih.

## 2 Potrebe naročnika

**Primarni naročnik:** 
Kronoterm – proizvajalec toplotnih črpalk, ki želi omogočiti glasovno upravljanje svojih naprav prek Apple Siri in Home Assistant.

**Sekundarni deležniki:**
- **Izvajalci predmeta Tehnologie programske opreme**  
- **Uporabniki toplotnih črpalk Kronoterm:** želijo enostavno in intuitivno upravljanje ogrevalnega sistema s pomočjo glasovnih ukazov.
- **Razvijalci integracij:** želijo jasne in stabilne API-je ter podporo za razvoj.
- **Apple in Home Assistant skupnost:** želijo zagotoviti brezhibno povezljivost in stabilno delovanje.

#### Želje deležnikov

- **Kronoterm** želi povečati konkurenčnost svojih izdelkov z dodajanjem sodobne funkcionalnosti glasovnega upravljanja.
- **Uporabniki** pričakujejo preprosto in zanesljivo glasovno upravljanje ogrevanja, sanitarne vode in prezračevanja.
- **Razvijalci** želijo dobro dokumentirane API-je za lažje razvijanje funkcij.
- **Apple/Home Assistant skupnost** pričakujejo stabilno in varno integracijo brez zamikov pri obdelavi ukazov.

#### Želena splošna izkušnja

- Enostavna povezava toplotne črpalke s Siri in Home Assistant.
- Glasovni ukazi, ki so jasni in intuitivni.
- Takojšnja povratna informacija o izvedbi ukazov.
- Brezhibno delovanje funkcij brez ročnega posredovanja uporabnika.


### 2.1 Uporabniške zahteve

#### **Epske uporabniške zgodbe**

1. **Kot uporabnik** želim glasovno upravljati temperaturo v svojem domu, da bo vedno prijetno in energetsko učinkovito.
2. **Kot uporabnik** želim glasovno upravljati segrevanje in cirkulacijo sanitarne vode, da imam vedno na voljo toplo vodo.

4. **Kot uporabnik** želim glasovno aktivirati različne programe delovanja sistema, da bo sistem prilagojen mojim potrebam.
5. **Kot uporabnik** želim preverjati trenutno stanje sistema in prejemati povratne informacije, da vem, ali sistem deluje pravilno.

7. **Kot uporabnik** želim prejemati opozorila in obvestila o morebitnih napakah ali potrebi po vzdrževanju, da lahko pravočasno ukrepam.
8. **Kot uporabnik** želim spremljati porabo energije in optimizirati delovanje sistema, da zmanjšam stroške.

#### **Podrobne uporabniške zgodbe**

1. **Kot uporabnik** želim glasovno povišati temperaturo v določenem prostoru, da bo prostor prijetno ogret.
   - *Glede na to, da sem prijavljen uporabnik, ko izgovorim "Hej Siri, dvigni temperaturo v dnevni sobi za 2 stopinji," potem se temperatura v dnevni sobi poveča za 2 stopinji.*
   - *Glede na to, da imam več prostorov, ko izgovorim "Hej Siri, nastavi dnevno sobo na 22 stopinj," potem se temperatura v dnevni sobi ustrezno prilagodi.*
   - *Glede na to, da je sistem povezan s pametnimi termostati, ko izgovorim "Hej Siri, zvišaj temperaturo v dnevni sobi," potem se termostat v dnevni sobi prilagodi.*

2. **Kot uporabnik** želim glasovno znižati temperaturo v določenem prostoru, da bo prostor hladnejši.
   - *Glede na to, da sem prijavljen uporabnik, ko izgovorim "Hej Siri, znižaj temperaturo v spalnici na 20 stopinj," potem se temperatura v spalnici nastavi na 20 stopinj.*
   - *Glede na to, da imam več con ogrevanja, ko izgovorim "Hej Siri, zmanjšaj gretje v celotni hiši," potem sistem zniža temperaturo v vseh prostorih.*
   - *Glede na to, da je zunanja temperatura visoka, ko izgovorim "Hej Siri, znižaj temperaturo," potem sistem prilagodi notranjo temperaturo glede na zunanje pogoje.*

3. **Kot uporabnik** želim aktivirati hitro segrevanje sanitarne vode, da bo voda hitreje ogreta.
   - *Glede na to, da sem prijavljen uporabnik, ko izgovorim "Hej Siri, aktiviraj hitro segrevanje sanitarne vode," potem sistem aktivira funkcijo hitrega segrevanja.*
   - *Glede na to, da je poraba vode visoka, ko izgovorim "Hej Siri, hitro segrej vodo," potem sistem poveča moč segrevanja.*

4. **Kot uporabnik** želim zagnati cirkulacijo sanitarne vode, da bo topla voda takoj na voljo.
   - *Glede na to, da sem prijavljen uporabnik, ko izgovorim "Hej Siri, zaženi cirkulacijo sanitarne vode," potem sistem zažene cirkulacijo.*
   - *Glede na to, da je sistem povezan s pametnimi ventili, ko izgovorim "Hej Siri, zaženi cirkulacijo," potem se ventili odprejo za cirkulacijo.*

5. **Kot uporabnik** želim aktivirati program dopust, da sistem optimizira delovanje med mojo odsotnostjo.
   - *Glede na to, da sem prijavljen uporabnik, ko izgovorim "Hej Siri, aktiviraj program dopust za 7 dni," potem sistem preklopi na varčevanje energije.*
   - *Glede na to, da je sistem povezan s koledarjem, ko izgovorim "Hej Siri, nastavi dopust," potem sistem prilagodi delovanje glede na datume v koledarju.*

6. **Kot uporabnik** želim preveriti trenutno temperaturo v določenem prostoru, da bom vedel, ali je potrebno prilagajanje.
    - *Glede na to, da sem prijavljen uporabnik, ko izgovorim "Hej Siri, kakšna je temperatura v dnevni sobi?", potem sistem poda trenutno temperaturo v dnevni sobi.*
    - *Glede na to, da je Home Assistant (HA) povezan s toplotno črpalko, ko preverim temperaturo v HA, potem se prikaže enaka vrednost kot v Siri.*
    - *Glede na to, da imam več senzorjev, ko izgovorim "Hej Siri, preveri temperaturo," potem sistem poda povprečno temperaturo iz vseh senzorjev.*

7. **Kot uporabnik** želim preveriti, ali sem prijavljen v Home Assistant, da lahko uporabljam glasovne ukaze brez prekinitev.
    - *Glede na to, da nisem prijavljen v Home Assistant, ko izgovorim "Hej Siri, preveri stanje sistema," potem me sistem obvesti, da se moram najprej prijaviti.*
    - *Glede na to, da sem prijavljen v Home Assistant, ko izgovorim "Hej Siri, kakšna je temperatura v dnevni sobi?", potem dobim pravilno informacijo brez dodatne avtentikacije.*
    - *Glede na to, da je sistem povezan z več uporabniškimi računi, ko izgovorim "Hej Siri, preveri prijavo," potem sistem preveri stanje vseh povezanih računov.*

8. **Kot uporabnik** želim aktivirati varčevanje energije, da zmanjšam stroške ogrevanja.
    - *Glede na to, da sem prijavljen uporabnik, ko izgovorim "Hej Siri, aktiviraj varčevanje energije," potem sistem prilagodi delovanje za manjšo porabo.*
    - *Glede na to, da je zunanja temperatura ugodna, ko izgovorim "Hej Siri, varčuj z energijo," potem sistem prilagodi delovanje glede na zunanje pogoje.*

9. **Kot uporabnik** želim dobiti opozorilo, če je potrebno servisiranje sistema.
    - *Glede na to, da sem prijavljen uporabnik, ko izgovorim "Hej Siri, ali sistem potrebuje servis?", potem sistem poda informacije o potrebnem vzdrževanju.*
    - *Glede na to, da je sistem povezan s servisno službo, ko izgovorim "Hej Siri, preveri servis," potem sistem samodejno pošlje zahtevo za servisiranje.*

10. **Kot uporabnik** želim prejeti obvestilo, če temperatura v določenem prostoru presega varne meje.
    - *Glede na to, da sem prijavljen uporabnik, ko temperatura preseže določen prag, potem sistem pošlje glasovno obvestilo.*
    - *Glede na to, da imam nastavljene varnostne meje, ko izgovorim "Hej Siri, preveri varnostne meje," potem sistem poda informacije o trenutnem stanju.*

11. **Kot uporabnik** želim prejemati tedenske povzetke o porabi energije, da spremljam učinkovitost sistema.
    - *Glede na to, da sem prijavljen uporabnik, ko izgovorim "Hej Siri, pošlji mi povzetek porabe energije," potem sistem poda podatke o porabi.*
    - *Glede na to, da imam nastavljene cilje porabe, ko izgovorim "Hej Siri, preveri cilje porabe," potem sistem poda informacije o doseženih ciljih.*

12. **Kot uporabnik** želim ročno preglasiti urnik ogrevanja za določen čas, da lahko prilagodim temperaturo glede na trenutne potrebe.
    - *Glede na to, da sem prijavljen uporabnik, ko izgovorim "Hej Siri, izklopi urnik ogrevanja do jutri," potem sistem začasno onemogoči urnik in omogoči ročno upravljanje.*
    - *Glede na to, da imam nepredvidljive urnike, ko izgovorim "Hej Siri, prilagodi urnik," potem sistem omogoči ročno prilagajanje urnika.*

13. **Kot uporabnik** želim glasovno nastaviti prag zunanje temperature, pri katerem naj se začne ogrevanje ali hlajenje, da optimiziram energetsko učinkovitost.  
    - *Glede na to, da sem prijavljen uporabnik, ko izgovorim "Hej Siri, začni ogrevanje, ko temperatura pade pod 15 stopinj," potem sistem nastavi to pravilo.*
    - *Glede na to, da imam nastavljene različne prage za različne prostore, ko izgovorim "Hej Siri, nastavi prag za dnevno sobo," potem sistem prilagodi prag za določen prostor.*

14. **Kot uporabnik** želim glasovno preveriti trenutno zunanjo temperaturo, da bom vedel, ali je potrebno prilagajanje ogrevanja ali hlajenja.
    - *Glede na to, da sem prijavljen uporabnik, ko izgovorim "Hej Siri, kakšna je trenutna zunanja temperatura?", potem sistem poda trenutno zunanjo temperaturo ki jo zazna toplotna črpalka.*
    - *Glede na to, da je sistem povezan z vremenskimi storitvami, ko izgovorim "Hej Siri, preveri zunanjo temperaturo," potem sistem poda podatke iz vremenskih storitev.*
  
15. **Kot uporabnik** želim upravljati adaptivno regulacijo krivulje ogrevanja, da se sistem samodejno prilagaja glede na zunanje in notranje pogoje ter zagotavlja optimalno udobje in energetsko učinkovitost.

    - *Glede na to, da sem prijavljen uporabnik, ko izgovorim "Hej Siri, aktiviraj adaptivno regulacijo krivulje," potem sistem samodejno prilagodi ogrevalno krivuljo glede na zunanje in notranje pogoje.*
  
16. **Kot uporabnik** želim glasovno nastaviti urnik ogrevanja, da bo sistem samodejno prilagajal temperaturo glede na moj dnevni ritem.
    - *Glede na to, da sem prijavljen uporabnik, ko izgovorim "Hej Siri, nastavi urnik ogrevanja na delovne dni od 7:00 do 22:00," potem sistem nastavi urnik ogrevanja za delovne dni od 7:00 do 22:00.*
    - *Glede na to, da imam različne urnike za vikende, ko izgovorim "Hej Siri, nastavi urnik ogrevanja za vikende od 8:00 do 23:00," potem sistem nastavi urnik ogrevanja za vikende od 8:00 do 23:00.*

17. **Kot uporabnik** želim glasovno preveriti stanje toplotne črpalke, da bom vedel, ali deluje pravilno.
    - *Glede na to, da sem prijavljen uporabnik, ko izgovorim "Hej Siri, preveri stanje toplotne črpalke," potem sistem poda informacije o trenutnem stanju toplotne črpalke.*
    - *Glede na to, da je sistem povezan s servisno službo, ko izgovorim "Hej Siri, preveri napake na toplotni črpalki," potem sistem poda informacije o morebitnih napakah in predlaga rešitve.*

18. **Kot uporabnik** želim glasovno nastaviti različne temperature za različne prostore, da bo vsak prostor optimalno ogret.
    - *Glede na to, da sem prijavljen uporabnik, ko izgovorim "Hej Siri, nastavi spalnico na 18 stopinj," potem sistem nastavi temperaturo v spalnici na 18 stopinj.*
    - *Glede na to, da imam različne potrebe za različne prostore, ko izgovorim "Hej Siri, nastavi kuhinjo na 20 stopinj," potem sistem nastavi temperaturo v kuhinji na 20 stopinj.*

19. **Kot uporabnik** želim glasovno aktivirati nočni način ogrevanja, da sistem zmanjša temperaturo med spanjem.
    - *Glede na to, da sem prijavljen uporabnik, ko izgovorim "Hej Siri, aktiviraj nočni način," potem sistem zmanjša temperaturo v vseh prostorih za nočni čas.*
    - *Glede na to, da imam različne nastavitve za nočni način, ko izgovorim "Hej Siri, nastavi nočni način na 18 stopinj," potem sistem prilagodi temperaturo na 18 stopinj za nočni čas.*

20. **Kot uporabnik** želim glasovno preveriti zgodovino porabe energije, da lahko spremljam in analiziram porabo.
    - *Glede na to, da sem prijavljen uporabnik, ko izgovorim "Hej Siri, pokaži zgodovino porabe energije za prejšnji teden," potem sistem prikaže podatke o porabi energije za prejšnji teden.*
    - *Glede na to, da želim spremljati mesečno porabo, ko izgovorim "Hej Siri, pokaži mesečno porabo energije," potem sistem prikaže podatke o mesečni porabi energije.*

## 3 **Glavni cilji projekta vključujejo:**

Naročnik se sooča z izzivom enostavnega in intuitivnega upravljanja toplotne črpalke Kronoterm prek glasovnega asistenta. 

Z vpeljavo glasovnega upravljanja bo naročnik pridobil enostavnejše upravljanje in večjo avtomatizacijo.

Naročnik bo lahko enostavno upravljal ogrevanje svojega doma zgolj z glasom. S tem se bo izboljšala uporabniška izkušnja, saj bo interakcija z ogrevalnim sistemom postala naravna in brezhibna.

#### Končni izdelki projekta vključujejo:

- Izgradnjo stabilne integracije med Siri, Home Assistant in Kronoterm toplotno črpalko, ki bo zagotavljala zanesljivo komunikacijo.
- Izvedbo obsežnega testiranja, vključno z enotnimi testi, integracijskimi testi in uporabniškimi testi, za zagotavljanje stabilnosti in natančnosti sistema.

- Pripravo celovite dokumentacije, ki bo vključevala tehnične podrobnosti, specifikacije in navodila za uporabo sistema.

### 3.2 Merila uspeha

Za določitev meril uspeha smo preverili ustreznost ideje pri Kronoterm, in končnimi uporabniki ogrevalnih sistemov. Njihove potrebe in pričakovanja smo upoštevali pri oblikovanju kriterijev za uspešno izvedbo projekta. **Merila uspeha**, ki bodo kazala na uspešno izvedbo projekta, vključujejo:

#### Primarni naročnik (Kronoterm)

1. **Integracija s pametnim domom** – Zanesljiva povezava s Siri in Home Assistant za brezhibno upravljanje.

2. **Tehnična stabilnost** – Stabilno delovanje sistema brez napak pri prenosu podatkov.

3. **Dodana vrednost za uporabnike** – Povečana privlačnost izdelka in konkurenčna prednost na trgu.

#### Sekundarni naročnik (Uporabniki)

1. **Enostavnost uporabe** - Intuitiven in preprost glasovni nadzor ogrevalnega sistema.

2. **Zanesljivost** - Stabilna povezava med Siri, Home Assistant in Kronoterm toplotno črpalko brez prekinitev.

3. **Natančnost** - Visoka stopnja pravilno prepoznanih in izvedenih glasovnih ukazov (več kot X % natančnost).

4. **Prilagodljivost** - Podpora za različne scenarije in avtomatizacije v pametnem domu.

5. **Zadovoljstvo uporabnikov** - Pozitivne povratne informacije glede uporabnosti in dodane vrednosti sistema.


## 6 Vodenje projekta

Za upravljanje razvoja glasovnega upravljanja toplotne črpalke bomo uporabili agilno metodo **Scrum** z manjšimi prilagoditvami. Scrum master bo **Dimitar Djorlev** in vodja projekta bo **Aleksandar Mijatović**. 

**Dnevnik sprememb**
| Opis spremembe | Posledica spremembe                                   | Motivacija       | Datum         |
| :------------- | :---------------------------------------------------- | :--------------- | :------------ |
| Sprememba integracije zaradi drugačnega razumevanja dokumentacije črpalke | Prilagoditev sistema za pravilno delovanje | Zagotovitev pravilne in stabilne integracije s toplotno črpalko| 11.3.2025 |
| Posodabljanje posameznih aktivnosti | Sprememba ali raširitev posameznih aktivnosti | Boljše upravljanje in napredovanje pri projektu | 13.3.2025|
| Dodajanje nove uporabniške zahteve | Sprememba ali raširitev funkcionalnosti sistema | Izboljšanje uporabniške izkušnje in izpolnjevanje potreb Kronoterma | 14.3.2025 |

### 6.1 Usklajevanje ekipe 
Med sestanki nameravamo doseči natančno usklajevanje in napredek projekta, da bomo dosegli glavne cilje in zadovoljili potrebe naročnika. Na sestankih bomo redno pregledovali dosežene rezultate, identificirali morebitne ovire ter prilagajali načrt v skladu z dinamiko razvoja in potrebami naročnikov.

### 6.2 Projektni načrt

| Oznaka aktivnosti                    | A0                                                                                                          |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Naziv aktivnosti                     | Projektno vodenje                                                                                           |
| Obseg aktivnosti v ČD                | 2                                                                                                           |
| Seznam ciljev in izdelkov aktivnosti | Uspešno načrtovanje iteracij, določitev vlog članov ekipe, spoštovanje rokov ter uspešno zaključen projekt. |
| Opis aktivnosti                      | Vodja projekta načrtuje redne sestanke, kjer bodo obravnavane vse dokončane, spremenjene ali neuspešne naloge. |
| Morebitne odvisnosti in omejitve     | / |
| Aktivnost je na Kritične poti        | Ni na kritične poti |
| Končan Izdelek                       | / |

| Oznaka aktivnosti                    | A1                                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Naziv aktivnosti                     | Seznanitev s pojmi, povezanimi s Home Assistant.                                                        |
| Obseg aktivnosti v ČD                | 20                                                                                                       |
| Seznam ciljev in izdelkov aktivnosti | Razumevanje ključnih konceptov in tehnologij, povezanih s Home Assistant.                               |
| Opis aktivnosti                      | Člani ekipe preučijo osnovne koncepte obeh tehnologij, da pridobijo razumevanje za nadaljnje delo iz razpoložljive dokumentacije na spletu. |
| Morebitne odvisnosti in omejitve     | / |
| Aktivnost je na Kritične poti        | **Na kritične poti** |
| Končan Izdelek                       | / |

| Oznaka aktivnosti                    | A2                                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Naziv aktivnosti                     | Branje dokumentacije za Kronoterm                                                                       |
| Obseg aktivnosti v ČD                | 20                                                                                                      |
| Seznam ciljev in izdelkov aktivnosti | Pridobitev podrobnega vpogleda v delovanje sistema Kronoterm.                                           |
| Opis aktivnosti                      | Člani ekipe preučijo uradno dokumentacijo in druge vire, ki podrobno opisujejo sistem Kronoterm, ter se posvetujejo z zaposlenimi pri Kronoterm v primeru nejasnosti. |
| Morebitne odvisnosti in omejitve     | / |
| Aktivnost je na Kritične poti        | **Na kritične poti** |
| Končan Izdelek                       | / |

| Oznaka aktivnosti                    | A3                                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Naziv aktivnosti                     | Seznanitev s toplotno črpalko Kronoterm                                                                 |
| Obseg aktivnosti v ČD                | 5                                                                                                       |
| Seznam ciljev in izdelkov aktivnosti | Pridobitev podrobnega vpogleda v delovanje toplotne črpalke Kronoterm.                                  |
| Opis aktivnosti                      | Člani ekipe spoznajo osnovno funkcionalnost strojne komponente in njen način delovanja (vrste senzorjev itd.). |
| Morebitne odvisnosti in omejitve     | A2 |
| Aktivnost je na Kritične poti        | Ni na kritične poti |
| Končan Izdelek                       | / |

| Oznaka aktivnosti                    | A4                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Naziv aktivnosti                     | Definiranje uporabniških zgodb in testov sprejemljivosti                                              |
| Obseg aktivnosti v ČD                | 5                                                                                                     |
| Seznam ciljev in izdelkov aktivnosti | Jasno izdelani uporabniški scenariji, razumevanje zahtev naročnika in testni primeri za preverjanje pravilnega delovanja sistema. |
| Opis aktivnosti                      | Razvijalec na podlagi zahtev naročnika in specifikacij definira ključne uporabniške zgodbe ter pripravi teste sprejemljivosti. |
| Morebitne odvisnosti in omejitve     | / |
| Aktivnost je na Kritične poti        | Ni na kritične poti |
| Končan Izdelek                       | / |

| Oznaka aktivnosti                    | A5                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Naziv aktivnosti                     | Definiranje ciljev projekta in izdelava osnutka opisa sistema                                          |
| Obseg aktivnosti v ČD                | 4.5                                                                                                     |
| Seznam ciljev in izdelkov aktivnosti | Jasno definirani izdelki in cilji projekta, izdelan načelni opis projekta.                            |
| Opis aktivnosti                      | Razvijalec razmišlja o zahtevah naročnika ter o že definiranih uporabniških zgodbah in na podlagi tega definira cilje projekta ter kratek opis, kako naj bi rešitev delovala. |
| Morebitne odvisnosti in omejitve     | A4 |
| Aktivnost je na Kritične poti        | Ni na kritične poti |
| Končan Izdelek                       | / |

| Oznaka aktivnosti                    | A6                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------- |
| Naziv aktivnosti                     | Planiranje implementacije                                                             |
| Obseg aktivnosti v ČD                | 4                                                                                     |
| Seznam ciljev in izdelkov aktivnosti | Opredelitev glavnih faz implementacije, določitev nalog in odgovornosti članov ekipe. |
| Opis aktivnosti                      | Razvijalci načrtujejo, kako bodo posamezne funkcionalnosti razvite in integrirane.    |
| Morebitne odvisnosti in omejitve     | A1, A2, A3, A5                                                                        |
| Aktivnost je na Kritične poti        | Ni na kritične poti                                                                   |
| Končan Izdelek                       | /                                                                                     |

| Oznaka aktivnosti                    | A7                                                                                                        |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Naziv aktivnosti                     | Načrtovanje vodenja projekta in izdelava projektnega načrta                                               |
| Obseg aktivnosti v ČD                | 5                                                                                                         |
| Seznam ciljev in izdelkov aktivnosti | Dokumentiran projektni načrt, ki vključuje časovni razpored in ključne mejnike.                           |
| Opis aktivnosti                      | Razvijalec in ekipa določijo projektni načrt, vključno s časovnico, odgovornostmi in poročanjem napredka. |
| Morebitne odvisnosti in omejitve     | A4                                                                                                        |
| Aktivnost je na Kritične poti        | Ni na kritične poti                                                                                       |
| Končan Izdelek                       | /                                                                                                         |

| Oznaka aktivnosti                    | A8                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| Naziv aktivnosti                     | Načrtovanje tveganj                                                                        |
| Obseg aktivnosti v ČD                | 6                                                                                          |
| Seznam ciljev in izdelkov aktivnosti | Identificirani možni problemi in strategije za njihovo obvladovanje.                       |
| Opis aktivnosti                      | Razvijalec analizira možne težave, ki bi lahko vplivale na projekt, ter predlaga rešitve.  |
| Morebitne odvisnosti in omejitve     | A4, A7                                                                                     |
| Aktivnost je na Kritične poti        | Ni na kritične poti                                                                        |
| Končan Izdelek                       | /                                                                                          |

| Oznaka aktivnosti                    | A9                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Naziv aktivnosti                     | Dokončanje izdelave predloga projekta in definiranje poteka naslednje iteracije                        |
| Obseg aktivnosti v ČD                | 5                                                                                                      |
| Seznam ciljev in izdelkov aktivnosti | Dopolnjen predlog projekta z določenim načrtom za naslednjo fazo razvoja.                              |
| Opis aktivnosti                      | Razvijalec dokonča začetni predlog projekta in definira naloge za naslednjo razvojno iteracijo.        |
| Morebitne odvisnosti in omejitve     | A5, A6, A7, A8                                                                                         |
| Aktivnost je na Kritične poti        | Ni na kritične poti                                                                                    |
| Končan Izdelek                       | /                                                                                                      |


| Oznaka aktivnosti                    | A10                                                                                                  |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Naziv aktivnosti                     | Razvoj osnovnega API-ja za komunikacijo med Home Assistant in Kronoterm                              |
| Obseg aktivnosti v ČD                | 35                                                                                                   |
| Seznam ciljev in izdelkov aktivnosti | Osnovni API, ki omogoča komunikacijo med Home Assistant in Kronoterm ter izmenjavo podatkov.         |
| Opis aktivnosti                      | Razvijalec implementira osnovni API, ki bo omogočal povezavo in prenos podatkov med obema sistemoma. |
| Morebitne odvisnosti in omejitve     | A1, A2, A3                                                                                           |
| Aktivnost je na Kritične poti        | Na kritične poti                                                                                     |
| Končan Izdelek                       | Končan API                                                                                           |

| Oznaka aktivnosti                    | A11                                                                                            |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Naziv aktivnosti                     | Razvoj govornega vmesnika (prepoznavanje ukazov)                                               |
| Obseg aktivnosti v ČD                | 35                                                                                             |
| Seznam ciljev in izdelkov aktivnosti | Integracija govornega vmesnika za prepoznavanje in interpretacijo glasovnih ukazov.            |
| Opis aktivnosti                      | Razvijalec razvije funkcionalnost za prepoznavanje ukazov in njihovo pravilno interpretacijo.  |
| Morebitne odvisnosti in omejitve     | A10                                                                                            |
| Aktivnost je na Kritične poti        | **Na kritične poti**                                                                           |
| Končan Izdelek                       | /                                                                                              |

| Oznaka aktivnosti                    | A12                                                                        |
| ------------------------------------ | -------------------------------------------------------------------------- |
| Naziv aktivnosti                     | Definiranje poteka naslednje iteracije                                     |
| Obseg aktivnosti v ČD                | 4.5                                                                        |
| Seznam ciljev in izdelkov aktivnosti | Načrt nove iteracije, določitev nalog in roka izvedbe.                     |
| Opis aktivnosti                      | Razvijaleci določijo ključne naloge in faze naslednje razvojne iteracije.  |
| Morebitne odvisnosti in omejitve     | A10, A11                                                                   |
| Aktivnost je na Kritične poti        | **Na kritične poti**                                                       |
| Končan Izdelek                       | /                                                                          |


| Oznaka aktivnosti                    | A13                                                                             |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| Naziv aktivnosti                     | Integracija narejenih komponent projekta                                        |
| Obseg aktivnosti v ČD                | 45                                                                              |
| Seznam ciljev in izdelkov aktivnosti | Povezovanje različnih modulov v celovit sistem.                                 |
| Opis aktivnosti                      | Razvijalec združuje razvite komponente in preverja njihovo pravilno delovanje.  |
| Morebitne odvisnosti in omejitve     | A12                                                                             |
| Aktivnost je na Kritične poti        | **Na kritične poti**                                                            |
| Končan Izdelek                       | /                                                                               |

| Oznaka aktivnosti                    | A14                                                                               |
| ------------------------------------ | --------------------------------------------------------------------------------- |
| Naziv aktivnosti                     | Priprava testov                                                                   |
| Obseg aktivnosti v ČD                | 10                                                                                |
| Seznam ciljev in izdelkov aktivnosti | Definiranje testnih scenarijev in priprava testnih podatkov.                      |
| Opis aktivnosti                      | Razvijalec pripravi testne primere za preverjanje pravilnosti delovanja sistema.  |
| Morebitne odvisnosti in omejitve     | A10, A11, A13                                                                     |
| Aktivnost je na Kritične poti        | Ni na kritične poti                                                               |
| Končan Izdelek                       | Narejeni testi                                                                    |

| Oznaka aktivnosti                    | A15                                                                    |
| ------------------------------------ | ---------------------------------------------------------------------- |
| Naziv aktivnosti                     | Izvedba testov delovanja komponent                                     |
| Obseg aktivnosti v ČD                | 25                                                                     |
| Seznam ciljev in izdelkov aktivnosti | Preverjanje pravilnega delovanja posameznih komponent sistema.         |
| Opis aktivnosti                      | Razvijalec izvaja testne scenarije in beleži morebitne napake.         |
| Morebitne odvisnosti in omejitve     | A10, A11, A13                                                          |
| Aktivnost je na Kritične poti        | **Na kritične poti**                                                   |
| Končan Izdelek                       | /                                                                      |

| Oznaka aktivnosti                    | A16                                                                                     |
| ------------------------------------ | --------------------------------------------------------------------------------------- |
| Naziv aktivnosti                     | Pregled že narejenega dela in definiranje naslednje iteracije                           |
| Obseg aktivnosti v ČD                | 4.5                                                                                     |
| Seznam ciljev in izdelkov aktivnosti | Dokumentacija napredka, določitev novih ciljev za naslednjo razvojno iteracijo.         |
| Opis aktivnosti                      | Razvijalec analizirajo opravljeno delo in določijo korake za nadaljnji razvoj.          |
| Morebitne odvisnosti in omejitve     | A13, A14, A15                                                                           |
| Aktivnost je na Kritične poti        | Ni na kritične poti                                                                     |
| Končan Izdelek                       | /                                                                                       |

| Oznaka aktivnosti                    | A17                                                                                          |
| ------------------------------------ | -------------------------------------------------------------------------------------------- |
| Naziv aktivnosti                     | Testiranje v simulaciji                                                                      |
| Obseg aktivnosti v ČD                | 20                                                                                           |
| Seznam ciljev in izdelkov aktivnosti | Simulacija delovanja sistema in analiza njegovega obnašanja v različnih scenarijih.          |
| Opis aktivnosti                      | Razvijalec izvaja testne scenarije v simuliranem okolju za preverjanje robustnosti sistema.  |
| Morebitne odvisnosti in omejitve     | A14, A15                                                                                     |
| Aktivnost je na Kritične poti        | **Na kritične poti**                                                                         |
| Končan Izdelek                       | /                                                                                            |

| Oznaka aktivnosti                    | A18                                                                               |
| ------------------------------------ | --------------------------------------------------------------------------------- |
| Naziv aktivnosti                     | Testiranje v realnem okolju                                                       |
| Obseg aktivnosti v ČD                | 35                                                                                |
| Seznam ciljev in izdelkov aktivnosti | Preverjanje delovanja celotnega sistema v realnih pogojih.                        |
| Opis aktivnosti                      | Razvijalec testira sistem v produkcijskem okolju in preverja njegovo stabilnost.  |
| Morebitne odvisnosti in omejitve     | A14, A15, A17                                                                     |
| Aktivnost je na Kritične poti        | **Na kritične poti**                                                              |
| Končan Izdelek                       | /                                                                                 |

| Oznaka aktivnosti                    | A19                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------- |
| Naziv aktivnosti                     | Finalizacija kode in dokumentacije                                                    |
| Obseg aktivnosti v ČD                | 10                                                                                    |
| Seznam ciljev in izdelkov aktivnosti | Čiščenje kode, optimizacija in priprava končne dokumentacije.                         |
| Opis aktivnosti                      | Razvijalec preverja in izboljšuje kodo ter dokumentira vse ključne dele sistema.      |
| Morebitne odvisnosti in omejitve     | A18                                                                                   |
| Aktivnost je na Kritične poti        | **Na kritične poti**                                                                  |
| Končan Izdelek                       | /                                                                                     |

| Oznaka aktivnosti                    | A20                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------- |
| Naziv aktivnosti                     | Končna izdaja sistema                                                                 |
| Obseg aktivnosti v ČD                | 8.5                                                                                   |
| Seznam ciljev in izdelkov aktivnosti | Končna različica sistema, pripravljena za uporabo.                                    |
| Opis aktivnosti                      | Razvijalec zaključi vse potrebne korake za objavo sistema in omogoči njegovo uporabo. |
| Morebitne odvisnosti in omejitve     | A19                                                                                   |
| Aktivnost je na Kritične poti        | **Na kritične poti**                                                                  |
| Končan Izdelek                       | /                                                                                     |


| Oznaka aktivnosti                    | A21                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------- |
| Naziv aktivnosti                     | Izdela prezentacijo projekta za naročitelja                                           |
| Obseg aktivnosti v ČD                | 1                                                                                     |
| Seznam ciljev in izdelkov aktivnosti | Priprava in vaje za prihodnjo predstavitev končne prezentacije za naročitelja.        |
| Opis aktivnosti                      | Razvijalec pripravi in vadi predstavitev projekta za naročitelja.                     |
| Morebitne odvisnosti in omejitve     | A19                                                                                   |
| Aktivnost je na Kritične poti        | Ni na kritični poti                                                                   |
| Končan Izdelek                       | /                                                                                     |


![Ganttov diagram](gradivo/img/gant_diagram.png)

**Ganttov diagram** (izvorna koda :bar_chart: [PlantUML](./GANTTtocka6.puml))

![PERT diagram](gradivo/img/pert_diagram.png "PERT diagram")

**Graf PERT** (izvorna koda :bar_chart: [PlantUML](./PERTtocka6.puml))


### 6.3 Finančni načrt

| Naziv funkcionalnosti                                                | Tip funkcionalnosti        | Obseg funkcionalnosti | Utež   |
| -------------------------------------------------------------------- | -------------------------- | --------------------- | ------ |
| Sprejemanje glasovnega ukaza od Siri Voice Assistant                 | Zunanji vhod               | _Low_                 | 3      |
| Pridobitev podatkov o stanju črpalke                                 | Zunanja vmesniška datoteka | _Average_             | 7      |
| Razumevanje glasovnega ukaza                                         | Zunanja poizvedba          | _High_                | 3      |
| Uspostavljanje povezave in integracije med HomeKit in Home Assistant | Zunanja poizvedba          | _Low_                 | 6      |
| Priprava poročila o delovanju črpalke (notification)                 | Zunanja poizvedba          | _Average_             | 4      |
| Izvedba neposrednega ukaza z uporabo HomeKit                         | Zunanji izhod              | _Low_                 | 4      |
| Izvedba glasovnega ukaza na črpalko                                  | Zunanji izhod              | _Average_             | 5      |
| Generiranje opozoril o napakah (max temperature reached)             | Zunanji izhod              | _Low_                 | 4      |
|                                                                      |                            | **Skupaj**            | **36** |


| Opis                                                              | Podrobnosti                                                                                           |
|----------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| Sprejemanje glasovnega ukaza od Siri Voice Assistant                 | glasovni ukaz |
| Pridobitev podatkov o stanju črpalke                                 | atribute: zunajna_temp, notrajna_temp, temp_vode, prejsni_ukaz, datum , ciljna_temp, cona_delovanja, hitrost_crpake_cona1, histrost_crpalke_cona2, hitrost_crpalke_cona3 v naslednje tabele: prejsne_komande, temperature, status_crpalke,  status_cona1, status_cona2, status_cona3, dnevnik|
| Razumevanje glasovnega ukaza                                         | v prejsne_komande in cona 1 2 3  zapisemo trenutni ukaz |
| Uspostavljanje povezave in integracije med HomeKit in Home Assistant |  v status_crpalke zapisemo status po izvedbo ukaza |
| Priprava poročila o delovanju črpalke (notification)                 | pri uspesno koncanje ukaza zapisemo u logs in u prejsne_komande tabele |
| Izvedba neposrednega ukaza z uporabo HomeKit                         | neposrednega ukaza zapisemo v tabeli prejsne_komande |
| Izvedba glasovnega ukaza na črpalko                                  | izhod do siri oblak in do kronoterm oblak |
| Generiranje opozoril o napakah (max temperature reached)             | opozorila pri neveljaven uhod pri log ali status |



Sklicali smo se na faktor SLOC z [naslednje strani:](https://www.ifpug.org/wp-content/uploads/2017/04/IYSM.-Thirty-years-of-IFPUG.-Software-Economics-and-Function-Point-Metrics-Capers-Jones.pdf).

**število vrstic programske kode** = 36 \* 53.333 = 1919.9 SLOC = **1,92 KSLOC**


- **Parameter B**

    | Dejavnik | Vrednost    | Utež   | 
    | -------- | ----------- | ------ |
    | **PREC** | zelo nizka  | 5      |
    | **FLEX** | zelo nizka  | 5      |
    | **RESL** | zelo visoka | 1      |
    | **TEAM** | nominalna   | 3      |
    | **PMAT** | nizka       | 4      |
    |          | Skupaj      | **18** |

    **B** = 1,01 + 0,01 \* 18 = **1,19**

    | Faktor | Opis |
    |--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | PREC | naša skupina še ni delala s homeAsistentu tud s usposabljanjem Siri asistenta. Prvič tudi sreča protokol, ki ga najemnik uporablja, in to je MQTT. |
    | FLEX | cilj projekta je definiran (voice commands to the toplotne črpalke) in nima sploh fleksibilnosti, da bi spreminjali katero od potrebnih funkcionalnosti. |
    | RESL | načrtovali smo vse tveganja, ki so možne pri našem projektu, in smo pripravljeni reagirati, če se kakšno zgodi. |
    | TEAM | Ekipa, ki bo delala na projektu, je prvič skupaj brez prejšnjega skupinskega dela, sicer se vsi poznamo in se družimo. Nekatere slabosti pokrivamo drug drugega. |

    PMAT

    | Key Process Areas (KPA) | Pogostost | Opis | KPA |
    |------------|-------------|------------------------------------------------------------------|------|
    | Upravljanje zahtev | Redko ali nikoli | Zahteve se večinoma sledijo, vendar niso vedno popolnoma določene in se prilagajajo sproti. | 1% |
    | Načrtovanje programske opreme | Redko ali nikoli | Načrtovanje poteka sproti zaradi pogostih sprememb funkcionalnosti in zahtev. | 1% |
    | Spremljanje in nadzor projektov | Redko ali nikoli | Le minimalno spremljanje poteka, saj nimamo dovolj časa in virov za obsežno upravljanje odstopanj. | 1% |
    | Upravljanje podizvajalcev | Redko ali nikoli | Običajno ne sodelujemo s podizvajalci zaradi omejenih finančnih virov in zanašanja na lastne zmogljivosti. | 1% |
    | Zagotavljanje kakovosti programske opreme | Občasno | Kakovost se preverja le v primeru resnih težav, pri čemer ukrepe določa višje vodstvo. | 10% |
    | Upravljanje konfiguracije programske opreme | Redko ali nikoli | Spremembe programske opreme se uvajajo brez predhodnega obveščanja, ekipa je obveščena šele po njihovi implementaciji. | 1% |
    | Osredotočenost na proces organizacije | Občasno | Občasno analiziramo prednosti in slabosti uporabljenih programskih procesov glede na standarde. | 10% |
    | Opredelitev procesov organizacije | Redko ali nikoli | Organizacija ne potrebuje stroge opredelitve procesov, saj se procesi prilagajajo potrebam projekta. | 1% |
    | Program usposabljanja | Redko ali nikoli | Formalna usposabljanja niso predvidena, saj projekte izvajamo na podlagi obstoječega znanja in izkušenj. | 1% |
    | Integrirano upravljanje programske opreme | Redko ali nikoli | Proces razvoja programske opreme ni natančno določen, upravljanje poteka po potrebi. | 1% |
    | Inženiring programske opreme | Občasno | Načela programskega inženirstva upoštevamo predvsem pri bolj kompleksnih projektih. | 10% |
    | Medskupinska koordinacija | Približno polovica | Komunikacija med ekipami poteka, vendar vsi člani nimajo popolne slike o končni rešitvi. | 40% |
    | Pregledi s strani sodelavcev | Redko ali nikoli | Pregledi niso formalizirani, saj se preverjanje izvaja sproti med razvojem. | 1% |
    | Kvantitativno upravljanje procesov | Redko ali nikoli | Uporaba kvantitativnih metod upravljanja je odvisna od zahtevnosti posameznega projekta. | 1% |
    | Upravljanje kakovosti programske opreme | Pogosto | Pomemben cilj je zagotoviti stabilno in delujočo rešitev. | 60% |
    | Preprečevanje napak | Približno polovica | Preventivni ukrepi so sprejeti le pri bolj zahtevnih projektih. | 40% |
    | Upravljanje tehnoloških sprememb | Redko ali nikoli | Tehnološke spremembe se uvajajo le v nujnih primerih, saj vsaka sprememba prinaša tveganja in dodatne napake. | 1% |
    | Upravljanje sprememb procesov | Redko ali nikoli | Procesi se po doseganju ciljev ne optimizirajo, razen če stranka zahteva dodatne spremembe. | 1% |


    $$
    EPML =  5 - \left[ \sum_{i=1}^{18} \left( \frac{KPA\%_i}{100} \times \frac{5}{18} \right) \right]
    $$

    **EPML** = 5 - (0 * 1 + 1 * 0.60 + 2 * 0.40 + 3 * 0.10 + 12 * 0.01 ) * 5/18 = **4.49**


- **Parameter M**

    | Dejavnik | Opis                                           | Ocena         | Razpon uteži | Utež        |
    | -------- | ---------------------------------------------- | ------------- | ------------ | ----------- |
    | PERS     | _Personal capability_                          | _Nominal_     | 1.5 - 0.5    | 1.0         |
    | PREX     | _Application platform and tools experience_    | _nizka_       | 1.5 - 0.5    | 1.2         |
    | RCPX     | _Product reliability & complexity_             | _Visoka_      | 0.5 - 1.5    | 1.1         |
    | RUSE     | _Reusability required_                         | _Zelo nizka_  | 0.5 - 1.5    | 0.5         |
    | PDIF     | _Platform difficulty_                          | _Zelo Visoka_ | 0.5 - 1.5    | 1.2         |
    | SCED     | _Schedule pressure_                            |               |              | 1.0         |
    | FCIL     | _Use of software tools, multisite development_ | _nizka_       | 1.5 - 0.5    | 1.2         |
    |          |                                                |               |              | **0.9504**  |

    | Dejavnik | Razlog                                                     |
    |--------------|---------------------------------------------------------------|
    | PERS     | Ekipa ima osnovno znanje in izkušnje, vendar ni izjemnih strokovnjakov. |
    | PREX     | Ekipa ima omejene izkušnje z orodji.                          |
    | RCPX     | Produkt je zahteven v smislu kompleksnosti in zanesljivosti.   |
    | RUSE     | Ponovna uporaba ni ključna za projekt.                        |
    | PDIF     | Platforma je zahtevna in zahteva napredno znanje.            |
    | FCIL     | Orodja in razvoj na več lokacijah niso zelo zahtevni.         |



_effort_<sub>ČM</sub> = A * *size*<sup>B</sup>  * _M_  
_effort_<sub>ČM</sub> = 2,94 *  1.920<sup>1.19</sup>  * 0.9504
**_effort_<sub>ČM</sub> = 6.07 _PM_**

**ŠCD = 3h 20min /dan**
**Urna postavka razvijalca: 30€**

Spodnja tabela prikazuje stroške posameznih aktivnosti.

| Oznaka aktivnosti | Naziv aktivnosti                                                                | Obseg dela (ŠČD) | Predvideni stroški dela (€) | Posredni stroški (€) | Skupni stroški (€) |
| ----------------- | ------------------------------------------------------------------------------- | ---------------  | --------------------------- | -------------------- | ------------------ |
| A0                | Projektno vodenje                                                               | 2                | 200                         | 20                   | 220                |
| A1                | Seznanitev s pojmi, povezanimi s Home Assistant.                                | 20               | 2000                        | 200                  | 2200               |
| A2                | Branje dokumentacije za Kronoterm                                               | 20               | 2000                        | 200                  | 2200               |
| A3                | Seznanitev s toplotno črpalko Kronoterm                                         | 5                | 500                         | 50                   | 550                |
| A4                | Definiranje uporabniških zgodb in testov sprejemljivosti                        | 5                | 500                         | 50                   | 550                |
| A5                |Definiranje ciljev projekta in izdelava osnutka opisa sistema                    | 4.5              | 450                         | 45                   | 495                |
| A6                | Planiranje implementacije                                                       | 4                | 400                         | 40                   | 440                |
| A7                |Načrtovanje vodenja projekta in izdelava projektnega načrta                      | 5                | 500                         | 50                   | 550                |
| A8                | Načrtovanje tveganj                                                             | 6                | 600                         | 60                   | 660                |
| A9                | Dokončanje izdelave predloga projekta in definiranje poteka naslednje iteracije | 5                | 500                         | 50                   | 550                |
| A10               | Razvoj osnovnega API-ja za komunikacijo med Home Assistant in Kronoterm         | 35               | 3500                        | 350                  | 3850               |
| A11               | Razvoj govornega vmesnika (prepoznavanje ukazov)                                | 35               | 3500                        | 350                  | 3850               |
| A12               | Definiranje poteka naslednje iteracije                                          | 4.5              | 450                         | 45                   | 495                |
| A13               | Integracija narejenih komponent projekta                                        | 45               | 4500                        | 450                  | 4950               |
| A14               | Priprava testov                                                                 | 10               | 1000                        | 100                  | 1100               |
| A15               | Izvedba testov delovanja komponent                                              | 25               | 2500                        | 250                  | 2750               |
| A16               | Pregled že narejenega dela in definiranje naslednje iteracije                   | 4.5              | 450                         | 45                   | 495                |
| A17               | Testiranje v simulaciji                                                         | 20               | 2000                        | 200                  | 2200               |
| A18               | Testiranje v realnem okolju                                                     | 35               | 3500                        | 350                  | 3850               |
| A19               | Finalizacija kode in dokumentacije                                              | 10               | 1000                        | 100                  | 1100               |
| A20               | Končna izdaja sistema                                                           | 9.5              | 950                         | 95                   | 1045               |

**Skupna cena projekta: 34,100 €**

## 7 Pregled ekipe

**Nihče** izmed članov ekipe še ni delal z integracijo Siri, Home Assistant ali Kronoterm toplotno črpalko, zato **pričakujemo izzive** pri implementaciji glasovnega upravljanja in zagotavljanju stabilne komunikacije med sistemi.

**Aleksandar Mijatović (Programer, Vodja ekipe):**
- Starost: 22
- Študij: Računalništvo in informatika, FRI UL
- Znanja in tehnologije: JavaScript, TypeScript, React, Node.js, SQL
- Vloge in prispevek: pisanje testov, komunikacija z naročnika
- Možna zamenjava: Dimitar Djorlev (za komunikacija z naročnika), Luka Mirovič (za pisanje testov)

**Dimitar Djorlev (Programer, Scrum master):** 
- Starost: 21
- Študij: Računalništvo in informatika, FRI UL
- Znanja in tehnologije: Python, TensorFlow, PyTorch, Java, C++, Git, Scrum metodologija
- Vloge in prispevek: optimizacija glasovnih ukazov, vodenje Scrum procesov
- Možna zamenjava: Dimitar Trajkov (za optimizacija glasovnih ukazov), Aleksandar Mijatović (za organizacijo dela)

**Dimitar Trajkov (Programer):**
- Starost: 21
- Študij: Računalništvo in informatika, FRI UL
- Znanja in tehnologije: Python, Pandas, NumPy, SQL, R, analiza podatkov
- Vloge in prispevek: podpora pri optimizacija glasovnih ukazov, dokumentacija
- Možna zamenjava: Petar Mishov (za dokumentacija), Dimitar Djorlev (optimizacija glasovnih ukazov)

**Petar Mishov (Programer):**
- Starost: 21
- Študij: Računalništvo in informatika, FRI UL
- Znanja in tehnologije: Python, Tableau, Pytorch, C++
- Vloge in prispevek: integracija različnih sistemov, dokumentacija
- Možna zamenjava: Luka Mirović (za integracija), Dimitar Trajkov (za dokumentacija)

**Luka Mirović (Programer):**
- Starost: 21
- Študij: Računalništvo in informatika, FRI UL
- Znanja in tehnologije: Java, Spring Boot, Node.js, Docker, Kubernetes, REST API, SQL
- Vloge in prispevek: integracija različnih sistemov
- Možna zamenjava: Petar Mishov (za integracija)

## 8 Omejitve in tveganja

### 8.1 Identifikacija

| Naziv tveganja | Upliva na | Opis tveganja | Tip tveganja | Verjetnost nastopa tveganja | Posledica nastopa tveganja |
| ----------- | ----------- | ----------- | ----------- | ----------- | ----------- |
| **`T1` Podcenjevanje zahtevnosti projekta** | Projekt | Napačna ocena obsega in kompleksnosti projekta lahko vodi do zamud ali slabega projekta. | Ocenjevanje | visoka | resna |
| **`T2` Napačno razumevanje začetnih zahtev naročnika** | Projekt in produkt | Nejasna ali napačno interpretirana pričakovanja naročnika lahko povzročijo razvoj neustreznih rešitev. | Zahteve | nizka | resna |
| **`T3` Neprimerna razdelitev dela** | Projekt | Slaba organizacija nalog med člani ekipe lahko pripelje do preobremenjenost posameznikov in neučinkovitost. | Organizacija | nizka | resna |
| **`T4` Pomankljive iskušnje/znanje članov ekipe** | Projekt | Nezadostno tehnično ali domen­sko znanje članov ekipe lahko upočasni razvoj ali povzroči napake. | Ljudje | zelo visoka | dopustna |
| **`T5` Okvara strojne opreme** | Produkt | Napake ali odpoved strojne opreme lahko povzročijo prekinitve delovanja sistema | Tehnologija | nizka | katastrofalna |
| **`T6` Neprimerna izvedba testiranje** | Produkt | Pomanjkljivo ali neučinkovito testiranje lahko vodi do odkritja napak šele po uvedbi produkta. | Orodje | zmerna | nepomembna |
| **`T7` Spremembe zahtev** | Projekt | Pogoste ali slabo upravljane spremembe zahtev lahko vodijo do zamud in povečanja stroškov. | Zahteve | zmerna | dopustna |
| **`T8` Neprimerna integracija orodij** | Produkt | Težave pri povezovanju uporabljenih orodij lahko zmanjšajo učinkovitost razvoja ali delovanje sistema. | Orodje | visoka | resna |
| **`T9` Nerazpoložljivost člana ekipe** | Projekt | Če član ekipe ni na voljo, se delo drugih članov poveča, kar lahko privede do zamud. | Ljudje | nizka | dopustna |
| **`T10` Podcenjevanje stroškov** | Projekt | Napačna finančna ocena lahko vodi do pomanjkanja sredstev za dokončanje projekta. | Ocenjevanje | zmerna | resna |
| **`T11` Stabilnost in kakovost podedovanega sistema** | Projekt in Produkt | Slabo dokumentirana ali zastarela programska oprema lahko oteži razvoj in integracijo. | Tehnologija | nizka | resna |
| **`T12` Neučinkovito vodenje agilnega procesa** | Projekt | Slaba implementacija agilnih metod lahko povzroči pomanjkanje usklajenosti in slabšo produktivnost ekipe. | Organizacija | zelo nizka | dopustna |
| **`T13` Nezaželen dostop (Broken Access Control)** | Produkt | Neavtoriziran dostop do sistema lahko povzroči resno varnostno tveganje. | Tehnologija | zelo nizka | katastrofalna |
| **`T14` Nezadostna zaščita podatkov (Sensitive Data Exposure)** | Produkt | Nezadostno šifriranje ali zaščita občutljivih podatkov lahko omogoči nepooblaščenim osebam da ugotovijo, kdaj je uporabnik doma. | Orodje | nizka | resna |
| **`T15` Man in the middle napad** | Produkt | Napad tipa Man-in-the-Middle se zgodi, ko napadalec prestreže komunikacijo med mqtt in toplotno črpalko, da bi pridobil dostop do podatkov | Orodje | nizka | resna | 
|**`T16` Neuspeh projekta** | Poslovanje | Projekt ne doseže zastavljenih ciljev, kar lahko povzroči finančno izgubo ali propad podjetja. | Ljudje | nizka | katastrofalna |
| **`T17`Težave z obvladovanjem dokumentacije** | Projekt | Pomanjkanje ustrezne dokumentacije lahko povzroči napačno interpretacijo zahtev ali oteži vzdrževanje sistema. | Organizacija | srednja | resna |
| **`T18`Neusklajenost s predpisi in zakonodajo** | Projekt in Produkt | Neupoštevanje zakonodaje ali predpisov, kot so GDPR, lahko povzroči pravne posledice in kazni. | Organizacija | nizka | resna |
| **`T19`Pomanjkanje podpore za nove tehnologije** | Projekt | Uporaba novih tehnologij brez ustrezne podpore lahko povzroči težave pri implementaciji in vzdrževanju sistema. | Tehnologija | srednja | dopustna |
| **`T20` Neželeno delovanje med malo verjetnimi dogodki** | Projekt in Produkt | Neželeni incidenti, ki se zgodijo zaradi redkih ali nepričakovanih dogodkov, lahko povzročijo okvare sistema ali zmanjšajo zanesljivost delovanja. | Tehnologija | nizka | resne |
| **`T21` Sprememba pravilnika o uporabi Home Assistant**  | Projekt in Produkt | Spremembe v pravilnikih o uporabi ali licenciranju Home Assistant lahko vplivajo na veljavnost in dostopnost obstoječih rešitev. | Organizacija | zmerna | resne |
| **`T22` Novi konkurenti na trgu** | Poslovanje | Na trg pride nov konkurenčni izdelek, ki ponuja boljšo, cenejšo ali naprednejšo rešitev, kar lahko zmanjša povpraševanje po obstoječi programski opremi. | Ljudje | nizka | resne |
| **`T23`Izredno stanje** | Poslovanje in Projekt | Nepredvideni dogodki, kot so vojna, epidemija ali ekstremni vremenski pogoji, lahko povzročijo prekinitve v dobavnih verigah, zmanjšanje dostopa do virov ali oteženo poslovanje. | ljudje | zelo nizka | katastrofalni |
| **`T24` Okvara komunikacijskega omrežja** | Produkt | Okvara omrežja (npr. Wi-Fi ali Ethernet povezava) lahko moti komunikacijo med Siri, Home Assistant in toplotno črpalko, kar vpliva na zanesljivost sistema.	| Tehnologija | nizka | resne |
| **`T25` Pomanjkanje finančne koristi za naročnika** | Projekt | Razviti sistem ne zagotavlja pričakovanih finančnih prihrankov ali povečanja produktivnosti za naročnika, kar pomeni, da se projekt ne izplača glede na investicijo. | Poslovanje | zelo nizka | Katastrofalna |

### 8.2 Matrika izpostavljenosti tveganj

![alt text](image-1.png)

| Naziv tveganja | Verjetnost nastopa tveganja | Posledica nastopa tveganja | Kategorija v matriki |
|----------|------------|------------|----------------|
| **`T1` Podcenjevanje zahtevnosti projekta** | Visoka | Resna | 🟥 Visoka |
| **`T8` Neprimerna integracija orodij** | Visoka | Resna | 🟥 Visoka |
| **`T10` Podcenjevanje stroškov** | Zmerna | Resna | 🟧 Srednje visoka |
| **`T17` Težave z obvladovanjem dokumentacije** | Srednja | Resna | 🟧 Srednje visoka |
| **`T21` Sprememba pravilnika o uporabi Home Assistant** | Zmerna | Resna | 🟧 Srednje visoka |
| **`T5` Okvara strojne opreme** | Majhna | Katastrofalna | 🟧 Srednje visoka |
| **`T16` Neuspeh projekta** | Majhna | Katastrofalna | 🟧 Srednje visoka |
| **`T4` Pomanjkanje izkušenj/znanja članov ekipe** | Zelo visoka | Dopustna | 🟧 Srednje visoka |
| **`T7` Spremembe zahtev** | Zmerna | Dopustna | 🟨 Srednja |
| **`T19` Pomanjkanje podpore za nove tehnologije** | Srednja | Dopustna | 🟨 Srednja |
| **`T2` Napačno razumevanje začetnih zahtev naročnika** | Majhna | Resna | 🟨 Srednja |
| **`T3` Neprimerna razdelitev dela** | Majhna | Resna | 🟨 Srednja |
| **`T11` Stabilnost in kakovost podedovanega sistema** | Majhna | Resna | 🟨 Srednja |
| **`T14` Nezadostna zaščita podatkov** | Majhna | Resna | 🟨 Srednja |
| **`T15` Man in the middle napad** | Majhna | Resna | 🟨 Srednja |
| **`T18` Neusklajenost s predpisi in zakonodajo** | Majhna | Resna | 🟨 Srednja |
| **`T20` Neželeno delovanje med malo verjetnimi dogodki** | Majhna | Resna | 🟨 Srednja |
| **`T22` Novi konkurenti na trgu** | Majhna | Resna | 🟨 Srednja |
| **`T24` Okvara komunikacijskega omrežja** | Majhna | Resna | 🟨 Srednja |
| **`T9` Nerazpoložljivost člana ekipe** | Majhna | Dopustna | 🟨 Srednja |
| **`T13` Nezaželen dostop (Broken Access Control)** | Zelo majhna | Katastrofalna | 🟨 Srednja |
| **`T25` Pomanjkanje finančne koristi za naročnika** | Zelo Majhna | Katastrofalna | 🟨 Srednja |
| **`T23` Izredno stanje** | Zelo majhna | Katastrofalna | 🟨 Srednja |
| **`T12` Neučinkovito vodenje agilnega procesa** | Zelo majhna | Dopustna | 🟩 Nizka |
| **`T6` Neprimerna izvedba testiranja** | Zmerna | Nepomembna | 🟩 Nizka |

### 8.3 Načrtovanje tveganj

| Naziv tveganja | Opis | Strategija |
|---------------|------|------------|
| **`T1` Podcenjevanje zahtevnosti projekta** | Podrobnejše načrtovanje, realistične ocene zahtevnosti in vključitev rezerv v načrt projekta. | Strategija zmanjševanja |
| **`T8` Neprimerna integracija orodij** | Tveganje se obvladuje z natančnim razumevanjem delovanja sistema, iskanjem najbolj optimalnih načinov integracije ter zgodnjim in temeljitim testiranjem, da se odkrijejo in omilijo morebitne težave. | Strategija izogibanja |
| **`T10` Podcenjevanje stroškov** | Bolj natančno ocenjevanje stroškov in vključitev varnostne rezerve v proračun. | Strategija zmanjševanja |
| **`T17` Težave z obvladovanjem dokumentacije** | Vzpostavitev jasnih postopkov za upravljanje dokumentacije in uporaba specializiranih orodij za organizacijo podatkov. | Strategija zmanjševanja |
| **`T21` Sprememba pravilnika o uporabi Home Assistant** | Prilagodljivost v načrtovanju in pravočasno spremljanje morebitnih sprememb predpisov. | Strategija zmanjševanja |
| **`T5` Okvara strojne opreme** | Redno vzdrževanje, uporaba zanesljive strojne opreme in vzpostavitev rezervnih sistemov. | Strategija zmanjševanja |
| **`T16` Neuspeh projekta** | Podrobno načrtovanje, sprotno spremljanje tveganj in prilagajanje strategij za preprečitev projektnega neuspeha. | Strategija izogibanja |
| **`T4` Pomanjkanje izkušenj/znanja članov ekipe** | Organizacija dodatnih izobraževanj, mentorstvo in sprotno učenje za izboljšanje kompetenc članov ekipe. | Strategija zmanjševanja |
| **`T7` Spremembe zahtev** | Uvedba postopkov za upravljanje sprememb (Change Management) in sprotno usklajevanje z naročnikom. | Strategija zmanjševanja |
| **`T19` Pomanjkanje podpore za nove tehnologije** | Spremljanje trendov, sodelovanje s strokovnjaki in pravočasno preizkušanje novih tehnologij za zagotovitev ustrezne podpore. | Strategija zmanjševanja |
| **`T2` Napačno razumevanje začetnih zahtev naročnika** | Pred začetkom projekta skupaj z naročnikom jasno opredelimo zahteve in odpravimo morebitne nejasnosti. Med izvajanjem projekta mu redno predstavljamo načrt ter vmesne rezultate postopkov. | Strategija izogibanja |
| **`T3` Neprimerna razdelitev dela** | Jasna definicija vlog in odgovornosti, uporaba preverjenih metodologij za upravljanje nalog. | Strategija zmanjševanja |
