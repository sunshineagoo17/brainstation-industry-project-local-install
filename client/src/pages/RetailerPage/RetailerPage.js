import { useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import SideNavigation from "../../components/SideNavigation/SideNavigation";
import RetailerList from "../../components/RetailerList/RetailerList";
import "./RetailerPage.scss";

const RetailerPage = () => {
  const { userId } = useParams(); 

  return (
    <div className="main-page">
      <div className="main-page__nav">
        <SideNavigation />
      </div>
      <main className="main-page__body">
        <div className="header-container">
          <Header userId={userId} />
        </div>
        <section className="retailer-list">
          <div className="retailer-list__container">
            <RetailerList userId={userId} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default RetailerPage;