import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DocumentosRequeridos() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/tipos-tramite?tab=documentos");
  }, [navigate]);

  return null;
}
