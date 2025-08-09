import { useNavigate } from 'react-router-dom';
import main_img from '../../img/logo_uerj.png';
import '../../Styles/Home/index.css'

function HomeComponent() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <article className="App-Body">
        <div className="App-container">
          <img src={main_img} className="Main-img" alt="logo" />
          <div className="Title-container">
            
            <h1 className="App-Title">
              Difusão Unidimensional de Partículas Neutras
            </h1>
          </div>
          <section className="cards">
            <div className="card" onClick={() => navigate('/naomultiplicativo')}>
              <h3>Meios não Multiplicativos</h3>
              <p>Estuda a difusão sem fonte multiplicativa.</p>
            </div>
            <div className="card" onClick={() => navigate('/multiplicativo')}>
              <h3>Meios Multiplicativos</h3>
              <p>Inclui processos de fissão.</p>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}

export default HomeComponent;
