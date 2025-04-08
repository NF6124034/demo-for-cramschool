import { useState } from 'react'
import './App.css'
import SnakeGame from './components/SnakeGame'
import CoinCollector3D from './components/CoinCollector3D'

function App() {
  const [activeTab, setActiveTab] = useState('about')

  return (
    <div className="container">
      <header className="header">
        <div className="profile">
          <div className="profile-image">
            <img src="/src/assets/images/pic1.png" alt="Profile" />
          </div>
          <h1>王妤</h1>
          <p>網頁開發者 / 設計師</p>
          <div className="social-links">
            <a href="#" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-github"></i>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <i className="fas fa-envelope"></i>
            </a>
          </div>
        </div>
      </header>

      <nav className="navigation">
        <button 
          className={activeTab === 'about' ? 'active' : ''} 
          onClick={() => setActiveTab('about')}
        >
          關於我
        </button>
        <button 
          className={activeTab === 'experience' ? 'active' : ''} 
          onClick={() => setActiveTab('experience')}
        >
          經歷
        </button>
        <button 
          className={activeTab === 'projects' ? 'active' : ''} 
          onClick={() => setActiveTab('projects')}
        >
          項目
        </button>
        <button 
          className={activeTab === 'contact' ? 'active' : ''} 
          onClick={() => setActiveTab('contact')}
        >
          聯絡方式
        </button>
        <button 
          className={activeTab === 'game' ? 'active' : ''} 
          onClick={() => setActiveTab('game')}
        >
          遊戲專區
        </button>
      </nav>

      <main className="content">
        {activeTab === 'about' && (
          <section className="about-section">
            <h2>關於我</h2>
            <p>
              嗨，我是王妤，一位熱愛創造與解決問題的網頁開發者。我擅長使用React、JavaScript和CSS構建現代化的網站和應用程序。
            </p>
            <h3>專長</h3>
            <div className="skills">
              <div className="skill-tag">React</div>
              <div className="skill-tag">JavaScript</div>
              <div className="skill-tag">HTML/CSS</div>
              <div className="skill-tag">Node.js</div>
              <div className="skill-tag">UI/UX設計</div>
            </div>
          </section>
        )}

        {activeTab === 'experience' && (
          <section className="experience-section">
            <h2>工作經歷</h2>
            <div className="experience-item">
              <h3>高級前端開發者</h3>
              <p className="company">ABC科技有限公司</p>
              <p className="period">2020年 - 現在</p>
              <p>負責開發和維護公司的主要產品界面，優化用戶體驗，提高網站性能。</p>
            </div>
            <div className="experience-item">
              <h3>網頁開發者</h3>
              <p className="company">XYZ創新工作室</p>
              <p className="period">2018年 - 2020年</p>
              <p>參與多個客戶項目的開發，從設計到實現全過程。</p>
            </div>
          </section>
        )}

        {activeTab === 'projects' && (
          <section className="projects-section">
            <h2>項目展示</h2>
            <div className="project-grid">
              <div className="project-card">
                <div className="project-image">
                  <img src="src\assets\images\dogpig.png" alt="項目預覽" />
                </div>
                <h3>電商平台</h3>
                <p>使用React和Node.js開發的完整電子商務解決方案。</p>
                <div className="project-links">
                  <a href="#">查看演示</a>
                  <a href="#">GitHub</a>
                </div>
              </div>
              <div className="project-card">
                <div className="project-image">
                  <img src="src\assets\images\pic2.png" alt="項目預覽" />
                </div>
                <h3>社交媒體應用</h3>
                <p>一個允許用戶分享內容的社交網絡應用。</p>
                <div className="project-links">
                  <a href="#">查看演示</a>
                  <a href="#">GitHub</a>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'contact' && (
          <section className="contact-section">
            <h2>聯絡我</h2>
            <form className="contact-form">
              <div className="form-group">
                <label htmlFor="name">姓名</label>
                <input type="text" id="name" name="name" />
              </div>
              <div className="form-group">
                <label htmlFor="email">電子郵件</label>
                <input type="email" id="email" name="email" />
              </div>
              <div className="form-group">
                <label htmlFor="message">訊息</label>
                <textarea id="message" name="message" rows="5"></textarea>
              </div>
              <button type="submit" className="submit-btn">發送</button>
            </form>
          </section>
        )}

        {activeTab === 'game' && (
          <section className="games-section">
            <h2>遊戲專區</h2>
            <div className="games-container">
              <div className="game-box">
                <h3>貪吃蛇遊戲</h3>
                <SnakeGame />
              </div>
              <div className="game-box">
                <h3>3D金幣收集遊戲</h3>
                <CoinCollector3D />
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} 個人網站. 版權所有.</p>
      </footer>
    </div>
  )
}

export default App
