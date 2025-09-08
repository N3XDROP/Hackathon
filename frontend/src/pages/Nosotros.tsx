import { Link } from "react-router-dom";
import ElectricBorder from "../components/ElectricBorder";
import styles from "./Nosotros.module.css";
import BlurText from "../components/BlurText";
import { Award, BriefcaseBusiness, Fan, Fence, LandPlot, Link2, RefreshCcw, Sparkles, Users, Users2 } from "lucide-react";
export default function Nosotros() {
  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <img
          src="/images/son.jpeg"
          alt="Imagen relacionada con SumerTIC"
          className={styles.heroImg}
        />
        <BlurText
          text="Acerca de SumerTic"
          delay={80}
          animateBy="letters"
          direction="top"
          className={styles.heroTitle}
        />
      </section>
      {/* ¿Quiénes somos? */}
      <section className={styles.sectionSurface}>
        <div className={styles.container}>
          <div className={styles.left}>
            <ElectricBorder
              color="#0f973aff"
              speed={1}
              chaos={0.5}
              thickness={3}
              className={styles.borderWrapper}
            >
              <img
                src="/images/emp.jpg"
                alt="Imagen relacionada con SumerTIC"
                className={styles.figuree}
              />
            </ElectricBorder>
          </div>
          <div className={styles.right}>
            <BlurText
              text="¿Quiénes somos?"
              delay={80}
              animateBy="letters" // puede ser "letters" o "words"
              direction="top"
              className={styles.titlee}
            />
            <p className={styles.text}>
              Somos una organización sin ánimo de lucro que reúne empresas de
              base tecnológica de Boyacá con el propósito de impulsar el
              progreso, la innovación y la competitividad en la región.
            </p>
            <p className={styles.text}>
              Trabajamos de manera asociativa para articular proyectos a gran
              escala, fortalecer capacidades y ofrecer productos y servicios
              tecnológicos de alta calidad.
            </p>
            <p className={styles.text}>
              Nuestro compromiso es promover el crecimiento económico y social
              de Boyacá, contribuyendo al desarrollo sostenible a través de la
              colaboración entre empresas, instituciones educativas y entidades
              públicas.
            </p>
          </div>
        </div>
      </section>
     {/* Propósito Superior */}
<section className={styles.purpose}>
  <div className={styles.purposeInner}>
    <div className={styles.badge}>
      <span>Propósito Superior</span>
    </div>

   

    <p className={styles.purposeText}>
      Conectamos empresas, apoyamos la transformación digital y creamos sinergias entre
      el sector público, privado y académico para acelerar el crecimiento sostenible.
    </p>

    <ul className={styles.purposeGrid}>
      <li className={styles.purposeItem}>
        <Sparkles className={styles.purposeIcon} />
        <div>
          <h3>Innovación que transforma</h3>
          <p>Impulsamos soluciones tecnológicas con impacto real en la región.</p>
        </div>
      </li>

      <li className={styles.purposeItem}>
        <Link2 className={styles.purposeIcon} />
        <div>
          <h3>Conexión empresarial</h3>
          <p>Articulamos alianzas estratégicas para crear valor compartido.</p>
        </div>
      </li>

      <li className={styles.purposeItem}>
        <Users className={styles.purposeIcon} />
        <div>
          <h3>Talento y conocimiento</h3>
          <p>Potenciamos capacidades junto a academia, sector público y empresas.</p>
        </div>
      </li>
    </ul>
  </div>
</section>


      <section className={styles.sectionBg}>
        <div className={styles.cardsWrapper}>
          <div className={styles.misionCard}>
            <div className={styles.visionHeader}>
              <span className={styles.visionIcon}>🎯</span>
              <h2 className={styles.visionTitle}>Misión</h2>
            </div>
            <p className={styles.visionText}>
              Impulsar el progreso y la innovación tecnológica a través de la
              asociatividad y la colaboración, promoviendo el crecimiento
              económico y social de la región. SUMERTIC trabaja para fortalecer
              el ecosistema digital de Boyacá, integrando tecnología,
              conocimiento y talento para crear soluciones de clase mundial.
            </p>
          </div>

          <div className={styles.visionCard}>
            <div className={styles.visionHeader}>
              <span className={styles.visionIcon}>🚀</span>
              <h2 className={styles.visionTitle}>Visión</h2>
            </div>
            <p className={styles.visionText}>
              En el 2030, el Clúster SumerTIC de Boyacá será el epicentro de
              ciencia, tecnología e innovación, que impulsa el desarrollo
              regional, conecta talento e industria digital para trascender
              internacionalmente, mejorando la calidad de vida y siendo
              reconocido como el mejor lugar para trabajar y potenciar negocios
              con el poder de la tecnología.
            </p>
          </div>
        </div>
      </section>

     <section className={styles.govLite}>
  <div className={styles.govLiteInner}>
    {/* FILA: acento + título */}
    <div className={styles.govLiteHeaderRow}>
      <span className={styles.valuesAccent} aria-hidden="true" />
      <h2 className={styles.govLiteTitle}>Gobernanza</h2>
    </div>

    {/* PÁRRAFO: debajo y centrado */}
    <p className={styles.govLiteText}>
      SUMERTIC está liderado por una Junta Directiva y un equipo de gestión, conformado por
      representantes de empresas afiliadas y especialistas en tecnología. Nuestra gobernanza se basa
      en <strong>colaboración, excelencia</strong> y <strong>adaptabilidad</strong> para responder a
      las necesidades de la región.
    </p>

    {/* Principios en “pills” */}
    <ul className={styles.govPills}>
      <li className={styles.govPill}>
        <Users2 className={styles.pillIcon} />
        <span>Colaboración</span>
      </li>
      <li className={styles.govPill}>
        <Award className={styles.pillIcon} />
        <span>Excelencia</span>
      </li>
      <li className={styles.govPill}>
        <RefreshCcw className={styles.pillIcon} />
        <span>Adaptabilidad</span>
      </li>
    </ul>
  </div>
</section>

      <section className={styles.valuesSection}>
        <div className={styles.valuesGrid2}>
          <div className={styles.valuesColLeft}>
            <div className={styles.valuesHeader}>
              <span className={styles.valuesAccent}></span>
              <div className={styles.valuesHeader}>
                <span className={styles.valuesAccent}></span>
                <BlurText
                  text="Nuestros valores"
                  delay={80}
                  animateBy="letters"
                  direction="top"
                  className={styles.valuesTitleBig}
                />
              </div>
            </div>
            <div className={styles.valuesColLeft}>
            <ul className={styles.valuesList}>
              <li className={styles.valueItem}>
                 <Fence className={styles.valueIcon} size={28} strokeWidth={2} />
                <div>
                  <h3 className={styles.valueHeading}>Colaboración</h3>
                  <p className={styles.valueText}>
                    ¡Porque juntos logramos lo extraordinario!
                  </p>
                </div>
              </li>

              <li className={styles.valueItem}>
                <Users className={styles.valueIcon} size={28} strokeWidth={2} />
                
                <div>
                  <h3 className={styles.valueHeading}>
                    Compromiso con la calidad
                  </h3>
                  <p className={styles.valueText}>
                    Somos fans de la Excelencia.
                  </p>
                </div>
              </li>

              <li className={styles.valueItem}>
                <Fan  className={styles.valueIcon} size={28} strokeWidth={2} />
                <div>
                  <h3 className={styles.valueHeading}>Adaptabilidad</h3>
                  <p className={styles.valueText}>Disfrutamos los cambios.</p>
                </div>
              </li>

              <li className={styles.valueItem}>
              <BriefcaseBusiness className={styles.valueIcon} size={28} strokeWidth={2} />
                <div>
                  <h3 className={styles.valueHeading}>
                    Responsabilidad social
                  </h3>
                  <p className={styles.valueText}>
                    Nadie ama a Boyacá como nosotros.
                  </p>
                </div>
              </li>

              <li className={styles.valueItem}>
             <LandPlot className={styles.valueIcon} size={28} strokeWidth={2} />
                <div>
                  <h3 className={styles.valueHeading}>Pensar en Grande</h3>
                  <p className={styles.valueText}>
                    Innovación sin límites, resultados extraordinarios.
                  </p>
                </div>
              </li>
            </ul>
          </div>
          </div>

          <div className={styles.valuesColRight}>
            <figure className={styles.valuesFigure}>
              <img
                src="/images/valores.jpg"
                alt="Equipo de trabajo colaborando"
                className={styles.valuesImage}
              />
              <span className={styles.imageAccent}></span>
            </figure>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.centerBox}>
          <h3 className={styles.ctaTitle}>¿Quieres unirte al Clúster?</h3>
          <p className={styles.ctaText}>
            Inicia tu proceso y sube tus documentos para ser evaluado por el
            Comité de Ingreso.
          </p>
          <Link to="/login" className={styles.ctaBtn}>
            Iniciar proceso
          </Link>
        </div>
      </section>
    </>
  );
}
