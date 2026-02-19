import { createBrowserRouter } from "react-router";
import App from "./app";
import Home from "./pages/home";
import Planos from "./pages/planos";
import PlanoDetalhe from "./pages/plano-detalhe";
import Operadoras from "./pages/operadoras";
import OperadoraDetalhe from "./pages/operadora-detalhe";
import Comparar from "./pages/comparar";
import Ranking from "./pages/ranking";
import ReajustesPage from "./pages/reajustes";
import Assistente from "./pages/assistente";
import Cotacao from "./pages/cotacao";
import Blog from "./pages/blog";
import BlogPost from "./pages/blog-post";
import Termos from "./pages/termos";
import Privacidade from "./pages/privacidade";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "planos", element: <Planos /> },
      { path: "planos/:id", element: <PlanoDetalhe /> },
      { path: "operadoras", element: <Operadoras /> },
      { path: "operadoras/:registro", element: <OperadoraDetalhe /> },
      { path: "comparar", element: <Comparar /> },
      { path: "ranking", element: <Ranking /> },
      { path: "reajustes", element: <ReajustesPage /> },
      { path: "assistente", element: <Assistente /> },
      { path: "cotacao", element: <Cotacao /> },
      { path: "blog", element: <Blog /> },
      { path: "blog/:slug", element: <BlogPost /> },
      { path: "termos", element: <Termos /> },
      { path: "privacidade", element: <Privacidade /> },
    ],
  },
]);
