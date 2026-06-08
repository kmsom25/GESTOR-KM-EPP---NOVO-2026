import React from 'react';

export const AppLogo = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 1200 850" 
    className={className}
    fill="none"
  >
    {/* Ícone Gráfico */}
    <g transform="translate(350, 40)">
      {/* Círculo Incompleto (Azul Escuro -> Obsidian) */}
      <path 
        d="M 180 20 A 210 210 0 1 1 50 350" 
        stroke="#0b0b0c" 
        strokeWidth="28" 
        strokeLinecap="round" 
        className="dark:stroke-slate-200"
      />
      
      {/* Arco Dourado Inferior-Esquerdo */}
      <path 
        d="M 40 280 A 230 230 0 0 0 350 450" 
        stroke="#D4AF37" 
        strokeWidth="18" 
        strokeLinecap="round"
      />
      
      {/* Barras (Crescentes) */}
      <rect x="120" y="240" width="45" height="110" rx="4" fill="#0b0b0c" className="dark:fill-slate-200"/>
      <rect x="195" y="190" width="45" height="160" rx="4" fill="#0b0b0c" className="dark:fill-slate-200"/>
      <rect x="270" y="140" width="45" height="210" rx="4" fill="#0b0b0c" className="dark:fill-slate-200"/>
      
      {/* Seta de Crescimento Dourada */}
      <path 
        d="M 100 320 L 180 250 L 250 270 L 320 180 L 390 120" 
        stroke="#D4AF37" 
        strokeWidth="22" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <polygon 
        points="390,120 440,90 420,150" 
        fill="#D4AF37"
      />
    </g>

    {/* Bloco de Texto */}
    <g transform="translate(600, 600)">
      {/* Nome Principal */}
      <text 
        textAnchor="middle" 
        fontFamily="Times New Roman, serif" 
        fontSize="90" 
        fontWeight="bold"
        fill="#0b0b0c" 
        letterSpacing="4"
        className="dark:fill-white"
      >
        GESTOR FINANCEIRO
      </text>
      
      {/* Linhas Laterais e EPP */}
      <g transform="translate(0, 80)">
        {/* Linha Esquerda */}
        <line x1="-380" y1="-20" x2="-160" y2="-20" stroke="#D4AF37" strokeWidth="5"/>
        
        {/* KM EPP Centralizado */}
        <text 
          y="0"
          textAnchor="middle" 
          fontFamily="Times New Roman, serif" 
          fontSize="60" 
          fontWeight="bold"
          fill="#D4AF37" 
          letterSpacing="10"
        >
          KM EPP
        </text>
        
        {/* Linha Direita */}
        <line x1="160" y1="-20" x2="380" y2="-20" stroke="#D4AF37" strokeWidth="5"/>
      </g>
    </g>
  </svg>
);

