import { useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import SideNavigation from "../../components/SideNavigation/SideNavigation";
import ProductList from "../../components/ProductList/ProductList";
import "./ProductListPage.scss";

const ProductListPage = () => {
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
        <section className="product-list">
          <div className="product-list__container">
            <ProductList userId={userId} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductListPage;
